import nodemailer from "nodemailer";
import path from "path";
import { promises as fsPromises } from "fs";
import dns from "dns";
import net from "net";

// Creates a transporter using SMTP credentials from environment variables.
// Add the following to your .env:
//   EMAIL_USER=your_smtp_user
//   EMAIL_PASS=your_smtp_password_or_app_password
const normalizePort = (rawPort) => {
  const port = Number(rawPort || process.env.EMAIL_PORT || 587);
  return Number.isNaN(port) || port <= 0 ? 587 : port;
};

const getFallbackPort = (primaryPort) => {
  if (primaryPort === 465) return 587;
  if (primaryPort === 587) return 465;
  return 587;
};

const describePort = (port) => {
  if (port === 465) return "465 (SSL/TLS)";
  if (port === 587) return "587 (STARTTLS)";
  return `${port}`;
};

const formatMailerError = (err) => {
  if (!err) return "Unknown mail error";
  const parts = [];
  if (err.code) parts.push(`code=${err.code}`);
  if (err.command) parts.push(`command=${err.command}`);
  if (err.responseCode) parts.push(`responseCode=${err.responseCode}`);
  if (err.message) parts.push(`message=${err.message}`);
  return parts.length ? parts.join(" | ") : String(err);
};

const forceIpv4 = `${process.env.EMAIL_FORCE_IPV4 || "true"}`.toLowerCase() !== "false";
const dnsCacheTtlMs = Number(process.env.EMAIL_DNS_CACHE_TTL_MS || 300000);
const smtpIpv4Cache = new Map();

const resolveHostToIpv4 = async (host) => {
  if (!forceIpv4 || !host || net.isIP(host)) {
    return host;
  }

  const cached = smtpIpv4Cache.get(host);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.address;
  }

  try {
    const addresses = await dns.promises.resolve4(host);
    if (Array.isArray(addresses) && addresses.length > 0) {
      const address = addresses[0];
      smtpIpv4Cache.set(host, { address, expiresAt: Date.now() + dnsCacheTtlMs });
      return address;
    }
  } catch (resolveErr) {
    console.warn(`[mailer] resolve4 failed for ${host}:`, formatMailerError(resolveErr));
  }

  try {
    const lookupResult = await dns.promises.lookup(host, {
      family: 4,
      hints: dns.ADDRCONFIG,
    });
    if (lookupResult?.address) {
      const address = lookupResult.address;
      smtpIpv4Cache.set(host, { address, expiresAt: Date.now() + dnsCacheTtlMs });
      return address;
    }
  } catch (lookupErr) {
    console.warn(`[mailer] lookup(IPv4) failed for ${host}:`, formatMailerError(lookupErr));
  }

  return host;
};

const createTransporter = async (portOverride) => {
  const port = normalizePort(portOverride);
  const secure = port === 465;
  const configuredHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const connectionHost = await resolveHostToIpv4(configuredHost);

  return nodemailer.createTransport({
    host: connectionHost,
    port,
    secure,
    requireTLS: !secure,
    connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT || 12000),
    greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT || 12000),
    socketTimeout: Number(process.env.EMAIL_SOCKET_TIMEOUT || 20000),
    tls: {
      servername: configuredHost,
      minVersion: "TLSv1.2",
    },
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendWithPortFallback = async ({
  primaryPort,
  mailOptions,
  primaryLogLabel,
  fallbackLogLabel,
}) => {
  const normalizedPrimary = normalizePort(primaryPort);
  const fallbackPort = getFallbackPort(normalizedPrimary);
  const attempts =
    fallbackPort === normalizedPrimary
      ? [normalizedPrimary]
      : [normalizedPrimary, fallbackPort];

  let primaryError = null;
  const errors = [];

  for (let index = 0; index < attempts.length; index += 1) {
    const attemptPort = attempts[index];
    const transporter = await createTransporter(attemptPort);

    try {
      if (index === 1) {
        console.log(`[mailer] Attempting fallback using port ${describePort(attemptPort)}`);
      }

      await transporter.sendMail(mailOptions);
      return { sent: true, port: attemptPort };
    } catch (err) {
      if (index === 0) {
        primaryError = err;
        errors.push({ port: attemptPort, error: err });
        console.error(`[mailer] ${primaryLogLabel} (${describePort(attemptPort)}):`, formatMailerError(err));
      } else {
        errors.push({ port: attemptPort, error: err });
        console.error(`[mailer] ${fallbackLogLabel} (${describePort(attemptPort)}):`, formatMailerError(err));
      }
    }
  }

  return { sent: false, error: primaryError, errors };
};

const LOG_DIR = path.join(process.cwd(), "logs");
const NOTIF_FILE = path.join(LOG_DIR, "notifications.log");

async function writeFallbackNotification(type, payload) {
  try {
    await fsPromises.mkdir(LOG_DIR, { recursive: true });
    const entry = { type, timestamp: new Date().toISOString(), payload };
    await fsPromises.appendFile(NOTIF_FILE, JSON.stringify(entry) + "\n", "utf8");
    console.log(`[mailer] Wrote fallback notification to ${NOTIF_FILE}`);
    return true;
  } catch (e) {
    console.error('[mailer] Failed to write fallback notification:', e);
    return false;
  }
}

/**
 * Send a courier arrival email notification to a resident.
 */
export const sendCourierEmail = async ({
  toEmail,
  residentName,
  apartmentNumber,
  courierType,
  courierFrom,
  description,
  notifiedBy,
}) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[mailer] EMAIL_USER / EMAIL_PASS not set — skipping courier email.");
    return false;
  }

  const primaryPort = normalizePort(process.env.EMAIL_PORT);

  const courierFromLine = courierFrom
    ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Sender / Origin</td><td style="padding:6px 0;font-size:14px;font-weight:600;">${courierFrom}</td></tr>`
    : "";
  const descLine = description
    ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Note</td><td style="padding:6px 0;font-size:14px;">${description}</td></tr>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:32px 36px;text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">📦</div>
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">Courier Arrived!</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Apartment Management System</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 36px;">
            <p style="margin:0 0 20px;font-size:16px;color:#1e293b;">Dear <strong>${residentName}</strong>,</p>
            <p style="margin:0 0 24px;font-size:15px;color:#334155;line-height:1.6;">A courier has arrived at the security desk for your apartment (<strong>${apartmentNumber}</strong>). Please collect it at your earliest convenience.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
              <tr><td colspan="2" style="padding-bottom:12px;"><span style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;">Delivery Details</span></td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:14px;width:40%;">Courier Type</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e293b;">${courierType}</td></tr>
              ${courierFromLine}
              <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Logged by</td><td style="padding:6px 0;font-size:14px;color:#1e293b;">${notifiedBy} (Security)</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Time</td><td style="padding:6px 0;font-size:14px;color:#1e293b;">${new Date().toLocaleString()}</td></tr>
              ${descLine}
            </table>
            <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">This is an automated notification from the Apartment Management System.<br/>Please do not reply to this email.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 36px;text-align:center;"><p style="margin:0;font-size:12px;color:#94a3b8;">&copy; ${new Date().getFullYear()} Apartment Management System</p></td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const mailOptions = {
    from: `"Apartment Management" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `📦 Courier Arrived — Apt ${apartmentNumber}`,
    html,
  };

  const sendResult = await sendWithPortFallback({
    primaryPort,
    mailOptions,
    primaryLogLabel: 'Failed to send courier email (primary)',
    fallbackLogLabel: 'Failed to send courier email (fallback)',
  });

  if (sendResult.sent) {
    const suffix = sendResult.port === primaryPort ? '' : ' via fallback';
    console.log(`[mailer] Courier notification email sent to ${toEmail}${suffix}`);
    return true;
  }

  const err = sendResult.error;
  const allErrors = (sendResult.errors || []).map((entry) => ({
    port: entry.port,
    detail: formatMailerError(entry.error),
  }));

  // write fallback notification to disk so admin can see it when SMTP is down
  try {
    await writeFallbackNotification('courier', {
      toEmail,
      residentName,
      apartmentNumber,
      courierType,
      courierFrom,
      description,
      notifiedBy,
      error: formatMailerError(err),
      attempts: allErrors,
    });
  } catch (e) {
    console.error('[mailer] Error while writing courier fallback notification:', e);
  }

  return false;
};

/**
 * Send a notification to the admin when a new complaint/service request is submitted.
 */
export const sendComplaintNotificationToAdmin = async ({
  complaintId,
  category,
  subject,
  description,
  urgency,
  userName,
  userEmail,
  apartmentNumber,
  mobile,
  submittedAt,
}) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[mailer] EMAIL_USER / EMAIL_PASS not set — skipping admin email.');
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'serviceapartment906@gmail.com';
  const primaryPort = normalizePort(process.env.EMAIL_PORT);

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937">
      <h2>New ${category} Request Submitted</h2>
      <p>A new ${category.toLowerCase()} request has been submitted by <strong>${userName}</strong> (${userEmail}).</p>
      <table style="border-collapse:collapse;margin-top:12px;">
        <tr><td style="padding:6px 12px;font-weight:600">Complaint ID</td><td style="padding:6px 12px">${complaintId}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:600">Subject</td><td style="padding:6px 12px">${subject}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:600">Urgency</td><td style="padding:6px 12px">${urgency}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:600">Apartment</td><td style="padding:6px 12px">${apartmentNumber}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:600">Mobile</td><td style="padding:6px 12px">${mobile}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:600">Submitted At</td><td style="padding:6px 12px">${new Date(submittedAt).toLocaleString()}</td></tr>
      </table>
      <h4 style="margin-top:12px">Description</h4>
      <p style="white-space:pre-wrap;border-left:4px solid #e2e8f0;padding-left:12px;color:#374151">${description}</p>
      <p style="color:#6b7280;font-size:13px;margin-top:18px">This is an automated notification from the Apartment Management System.</p>
    </div>
  `;

  const mailOptions = {
    from: `"Apartment Management" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `New ${category} Request — ${subject}`,
    html,
  };

  const sendResult = await sendWithPortFallback({
    primaryPort,
    mailOptions,
    primaryLogLabel: 'Failed to send admin notification email (primary)',
    fallbackLogLabel: 'Failed to send admin notification email (fallback)',
  });

  if (sendResult.sent) {
    const suffix = sendResult.port === primaryPort ? '' : ' via fallback';
    console.log(`[mailer] Admin notified of new complaint ${complaintId} (sent to ${adminEmail})${suffix}`);
    return true;
  }

  const err = sendResult.error;
  const allErrors = (sendResult.errors || []).map((entry) => ({
    port: entry.port,
    detail: formatMailerError(entry.error),
  }));

  // write fallback notification to disk
  try {
    await writeFallbackNotification('admin_notification', {
      complaintId,
      category,
      subject,
      description,
      urgency,
      userName,
      userEmail,
      apartmentNumber,
      mobile,
      submittedAt,
      error: formatMailerError(err),
      attempts: allErrors,
    });
  } catch (e) {
    console.error('[mailer] Error while writing admin fallback notification:', e);
  }

  return false;
};

/**
 * Send a resolution confirmation email to the resident when their complaint is marked resolved.
 */
export const sendComplaintResolvedToUser = async ({
  toEmail,
  residentName,
  complaintId,
  subject,
  resolvedAt,
}) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[mailer] EMAIL_USER / EMAIL_PASS not set — skipping user resolved email.');
    return false;
  }

  const primaryPort = normalizePort(process.env.EMAIL_PORT);

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937">
      <h2>Your request has been resolved</h2>
      <p>Dear <strong>${residentName}</strong>,</p>
      <p>Your request (<strong>${subject}</strong>, ID: <strong>${complaintId}</strong>) has been marked <strong>resolved</strong> on ${new Date(resolvedAt).toLocaleString()}.</p>
      <p>If you feel the issue has not been fully addressed, please reopen the request or create a new one.</p>
      <p style="color:#6b7280;font-size:13px;margin-top:18px">This is an automated notification from the Apartment Management System.</p>
    </div>
  `;

  const mailOptions = {
    from: `"Apartment Management" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Request Resolved — ${subject}`,
    html,
  };

  const sendResult = await sendWithPortFallback({
    primaryPort,
    mailOptions,
    primaryLogLabel: 'Failed to send resolved email (primary)',
    fallbackLogLabel: 'Failed to send resolved email (fallback)',
  });

  if (sendResult.sent) {
    const suffix = sendResult.port === primaryPort ? '' : ' via fallback';
    console.log(`[mailer] Resolution email sent to ${toEmail} for complaint ${complaintId}${suffix}`);
    return true;
  }

  const err = sendResult.error;
  const allErrors = (sendResult.errors || []).map((entry) => ({
    port: entry.port,
    detail: formatMailerError(entry.error),
  }));

  // write fallback notification to disk
  try {
    await writeFallbackNotification('resolved_notification', {
      toEmail,
      residentName,
      complaintId,
      subject,
      resolvedAt,
      error: formatMailerError(err),
      attempts: allErrors,
    });
  } catch (e) {
    console.error('[mailer] Error while writing resolved fallback notification:', e);
  }

  return false;
};
