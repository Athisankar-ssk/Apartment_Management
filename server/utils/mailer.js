import nodemailer from "nodemailer";

// Creates a transporter using SMTP credentials from environment variables.
// Add the following to your .env:
//   EMAIL_USER=your_gmail_address@gmail.com
//   EMAIL_PASS=your_gmail_app_password   (use a Google App Password, not your account password)
const createTransporter = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,          // SSL
    family: 4,             // force IPv4 — avoids ENETUNREACH on IPv6-only attempts
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/**
 * Send a courier arrival email notification to a resident.
 *
 * @param {object} opts
 * @param {string} opts.toEmail        - Resident's email address
 * @param {string} opts.residentName   - Resident's full name
 * @param {string} opts.apartmentNumber
 * @param {string} opts.courierType    - e.g. "Package", "Letter", "Document"
 * @param {string} [opts.courierFrom]  - Sender / origin of the courier
 * @param {string} [opts.description]  - Extra details
 * @param {string} opts.notifiedBy     - Security officer's name
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
    console.warn("[mailer] EMAIL_USER / EMAIL_PASS not set — skipping email.");
    return;
  }

  const transporter = createTransporter();

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

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:32px 36px;text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">📦</div>
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
              Courier Arrived!
            </h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">
              Apartment Management System
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 36px;">
            <p style="margin:0 0 20px;font-size:16px;color:#1e293b;">
              Dear <strong>${residentName}</strong>,
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#334155;line-height:1.6;">
              A courier has arrived at the security desk for your apartment
              (<strong>${apartmentNumber}</strong>). Please collect it at your earliest convenience.
            </p>

            <!-- Details card -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
              <tr>
                <td colspan="2" style="padding-bottom:12px;">
                  <span style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;">
                    Delivery Details
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#64748b;font-size:14px;width:40%;">Courier Type</td>
                <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e293b;">${courierType}</td>
              </tr>
              ${courierFromLine}
              <tr>
                <td style="padding:6px 0;color:#64748b;font-size:14px;">Logged by</td>
                <td style="padding:6px 0;font-size:14px;color:#1e293b;">${notifiedBy} (Security)</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#64748b;font-size:14px;">Time</td>
                <td style="padding:6px 0;font-size:14px;color:#1e293b;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
              </tr>
              ${descLine}
            </table>

            <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
              This is an automated notification from the Apartment Management System.<br/>
              Please do not reply to this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 36px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              &copy; ${new Date().getFullYear()} Apartment Management System
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Apartment Management" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `📦 Courier Arrived — Apt ${apartmentNumber}`,
    html,
  });

  console.log(`[mailer] Courier notification email sent to ${toEmail}`);
};
