import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Overview.css";

function Overview() {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Navbar />
      <div className="overview">
        <header className="overview-hero">
          <div className="overview-hero-text">
            <h1>Live smarter in a vibrant apartment community.</h1>
            <p>
              Discover a modern, friendly place designed for comfort, safety, and
              convenience. From seamless service requests to community spaces,
              everything is crafted to make daily living feel effortless.
            </p>
            <a className="overview-cta" href="#services">
              Explore Services
            </a>
          </div>
          <div className="overview-hero-image">
            <img
              src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
              alt="Modern apartment living room with natural light"
            />
          </div>
        </header>

        <section className="overview-section" id="about">
          <h2 className="section-title">About Our Community</h2>
          <p className="section-subtitle">
            Designed for families, professionals, and students, our apartment
            community combines comfort with thoughtful amenities. Every space is
            created to feel welcoming and connected.
          </p>
          <div className="card-grid">
            <div className="info-card">
              <h3>Safe & Secure</h3>
              <p>
                24/7 monitoring, secure access points, and well-lit common areas
                keep everyone feeling protected.
              </p>
            </div>
            <div className="info-card">
              <h3>Community First</h3>
              <p>
                Enjoy regular events, shared spaces, and a warm neighborhood vibe
                that makes it easy to connect.
              </p>
            </div>
            <div className="info-card">
              <h3>Smart Living</h3>
              <p>
                Digital service requests, timely updates, and effortless booking
                for facilities are built in.
              </p>
            </div>
          </div>

          <div className="gallery" style={{ marginTop: "2rem" }}>
            <img
              src="https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=900&q=80"
              alt="Cozy apartment bedroom"
            />
            <img
              src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80"
              alt="Modern apartment kitchen"
            />
            <img
              src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80"
              alt="Apartment community lounge area"
            />
          </div>
        </section>

        <section className="overview-section" id="services">
          <h2 className="section-title">Services That Simplify Life</h2>
          <p className="section-subtitle">
            From maintenance support to facility bookings, everything is managed
            in one place so residents can focus on living.
          </p>
          <div className="card-grid">
            <div className="info-card">
              <h3>Maintenance Requests</h3>
              <p>Report issues quickly and track updates in real time.</p>
              <ul className="service-options">
                <li onClick={() => scrollToSection("water-maintenance")}>
                  <span className="option-icon">💧</span>
                  <span>Water Issues</span>
                </li>
                <li onClick={() => scrollToSection("electricity-maintenance")}>
                  <span className="option-icon">⚡</span>
                  <span>Electricity Issues</span>
                </li>
                <li onClick={() => scrollToSection("elevator-maintenance")}>
                  <span className="option-icon">🛗</span>
                  <span>Elevator Issues</span>
                </li>
                <li onClick={() => scrollToSection("other-maintenance")}>
                  <span className="option-icon">🔧</span>
                  <span>Other Maintenance</span>
                </li>
              </ul>
            </div>
            <div className="info-card">
              <h3>Facility Bookings</h3>
              <p>Reserve the party hall, swimming pool, or meeting spaces.</p>
              <ul className="service-options">
                <li onClick={() => scrollToSection("playground-facility")}>
                  <span className="option-icon">⚽</span>
                  <span>Playground</span>
                </li>
                <li onClick={() => scrollToSection("swimming-pool-facility")}>
                  <span className="option-icon">🏊</span>
                  <span>Swimming Pool</span>
                </li>
                <li onClick={() => scrollToSection("party-hall-facility")}>
                  <span className="option-icon">🎉</span>
                  <span>Party Hall</span>
                </li>
                <li onClick={() => scrollToSection("parking-facility")}>
                  <span className="option-icon">🚗</span>
                  <span>Vehicle Parking Slot</span>
                </li>
              </ul>
            </div>
            <div className="info-card">
              <h3>Billing & Notices</h3>
              <p>Stay up to date with electricity bills and community notices.</p>
            </div>
            <div className="info-card">
              <h3>Resident Support</h3>
              <p>Get quick help from the admin team whenever you need it.</p>
            </div>
          </div>
        </section>

        <section className="overview-section maintenance-section" id="water-maintenance">
          <h2 className="section-title">💧 Water Issues</h2>
          <p className="section-subtitle">
            We understand the importance of uninterrupted water supply. Report any
            leaks, low pressure, or quality concerns, and our team will address them
            promptly.
          </p>
          <div className="maintenance-content">
            <div className="maintenance-images">
              <img
                src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80"
                alt="Water pipeline maintenance"
              />
              <img
                src="https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?auto=format&fit=crop&w=800&q=80"
                alt="Plumbing repairs"
              />
            </div>
            <div className="maintenance-info">
              <h4>Common Water Issues We Handle:</h4>
              <ul>
                <li>Water leakage in pipes or fixtures</li>
                <li>Low water pressure</li>
                <li>Water quality concerns</li>
                <li>Blocked drain</li>
                <li>Water tank cleaning</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="overview-section maintenance-section" id="electricity-maintenance">
          <h2 className="section-title">⚡ Electricity Issues</h2>
          <p className="section-subtitle">
            Electrical safety is our priority. Whether it's a power outage, faulty
            wiring, or appliance issues, our certified electricians are ready to help.
          </p>
          <div className="maintenance-content">
            <div className="maintenance-images">
              <img
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
                alt="Electrical panel maintenance"
              />
              <img
                src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80"
                alt="Electrician working"
              />
            </div>
            <div className="maintenance-info">
              <h4>Electrical Services Include:</h4>
              <ul>
                <li>Power outage resolution</li>
                <li>Circuit breaker issues</li>
                <li>Light fixture repairs</li>
                <li>Switch and socket replacement</li>
                <li>Electrical safety inspections</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="overview-section maintenance-section" id="elevator-maintenance">
          <h2 className="section-title">🛗 Elevator Issues</h2>
          <p className="section-subtitle">
            Safe and reliable elevator service is essential. Report any malfunctions,
            unusual noises, or safety concerns immediately for swift resolution.
          </p>
          <div className="maintenance-content">
            <div className="maintenance-images">
              <img
                src="https://images.unsplash.com/photo-1562095241-8c6714fd4178?auto=format&fit=crop&w=800&q=80"
                alt="Modern elevator interior"
              />
              <img
                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80"
                alt="Elevator maintenance"
              />
            </div>
            <div className="maintenance-info">
              <h4>Elevator Support:</h4>
              <ul>
                <li>Elevator breakdown assistance</li>
                <li>Door malfunction repairs</li>
                <li>Button and control panel issues</li>
                <li>Emergency rescue protocols</li>
                <li>Regular safety inspections</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="overview-section maintenance-section" id="other-maintenance">
          <h2 className="section-title">🔧 Other Maintenance</h2>
          <p className="section-subtitle">
            From carpentry to general repairs, we handle all types of maintenance
            requests to keep your living space comfortable and functional.
          </p>
          <div className="maintenance-content">
            <div className="maintenance-images">
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"
                alt="General maintenance work"
              />
              <img
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
                alt="Repair tools"
              />
            </div>
            <div className="maintenance-info">
              <h4>Additional Services:</h4>
              <ul>
                <li>Door and window repairs</li>
                <li>Painting and touch-ups</li>
                <li>Furniture assembly</li>
                <li>Pest control</li>
                <li>HVAC maintenance</li>
                <li>General carpentry work</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="overview-section maintenance-section" id="playground-facility">
          <h2 className="section-title">⚽ Playground</h2>
          <p className="section-subtitle">
            A safe and well-maintained playground for children and sports enthusiasts.
            Book your slot for recreational activities and enjoy quality outdoor time.
          </p>
          <div className="maintenance-content">
            <div className="maintenance-images">
              <img
                src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80"
                alt="Children playing in playground"
              />
              <img
                src="https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80"
                alt="Outdoor sports facility"
              />
            </div>
            <div className="maintenance-info">
              <h4>Playground Features:</h4>
              <ul>
                <li>Multi-sport court (basketball, badminton)</li>
                <li>Children's play equipment</li>
                <li>Open green space for activities</li>
                <li>Evening lighting for extended hours</li>
                <li>Seating area for parents/guardians</li>
                <li>Safety surfacing and fencing</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="overview-section maintenance-section" id="swimming-pool-facility">
          <h2 className="section-title">🏊 Swimming Pool</h2>
          <p className="section-subtitle">
            Dive into relaxation with our clean and well-maintained swimming pool.
            Perfect for exercise, leisure, or teaching kids to swim in a safe environment.
          </p>
          <div className="maintenance-content">
            <div className="maintenance-images">
              <img
                src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80"
                alt="Modern swimming pool"
              />
            </div>
            <div className="maintenance-info">
              <h4>Pool Amenities:</h4>
              <ul>
                <li>Temperature-controlled water</li>
                <li>Separate shallow area for children</li>
                <li>Changing rooms and showers</li>
                <li>Lifeguard on duty during hours</li>
                <li>Pool lounge chairs and umbrellas</li>
                <li>Regular water quality maintenance</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="overview-section maintenance-section" id="party-hall-facility">
          <h2 className="section-title">🎉 Party Hall</h2>
          <p className="section-subtitle">
            Host memorable celebrations in our spacious party hall. Equipped with
            modern amenities, it's perfect for birthdays, anniversaries, and gatherings.
          </p>
          <div className="maintenance-content">
            <div className="maintenance-images">
              <img
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"
                alt="Party hall setup"
              />
              <img
                src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80"
                alt="Event venue"
              />
            </div>
            <div className="maintenance-info">
              <h4>Hall Features:</h4>
              <ul>
                <li>Spacious area accommodating 100+ guests</li>
                <li>Audio and visual equipment</li>
                <li>Kitchen facilities for catering</li>
                <li>Air conditioning and lighting</li>
                <li>Tables, chairs, and stage setup</li>
                <li>Flexible decoration options</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="overview-section maintenance-section" id="parking-facility">
          <h2 className="section-title">🚗 Vehicle Parking Slot</h2>
          <p className="section-subtitle">
            Secure parking spaces for residents and guests. Book additional slots for
            special occasions or extended parking needs with ease.
          </p>
          <div className="maintenance-content">
            <div className="maintenance-images">
              <img
                src="https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80"
                alt="Modern parking facility"
              />
              <img
                src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80"
                alt="Covered parking area"
              />
            </div>
            <div className="maintenance-info">
              <h4>Parking Benefits:</h4>
              <ul>
                <li>Covered parking protection</li>
                <li>24/7 security surveillance</li>
                <li>Well-lit parking areas</li>
                <li>Designated visitor parking</li>
                <li>Electric vehicle charging stations</li>
                <li>Easy access and maneuverability</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="overview-section" id="contact">
          <h2 className="section-title">Contact & Visit</h2>
          <p className="section-subtitle">
            Have questions or want to schedule a visit? We’re ready to help.
          </p>
          <div className="contact-grid">
            <div className="contact-card">
              <h4>Address</h4>
              <p>12 Sunrise Avenue, Green Park, Chennai</p>
            </div>
            <div className="contact-card">
              <h4>Phone</h4>
              <p>+91 98765 43210</p>
            </div>
            <div className="contact-card">
              <h4>Email</h4>
              <p>hello@apartmentcommunity.com</p>
            </div>
          </div>

          <div className="highlight-banner">
            <span>Ready to explore the community experience?</span>
            <a href="#about">Learn more about us</a>
          </div>
        </section>
      </div>
    </>
  );
}

export default Overview;
