import "./App.css";

import heroImage from "./assets/hero.png";
import { benefits, locationSteps, rentalItems } from "./locationData.js";
import { AdminNavLink } from "./SessionNav.jsx";

function LocationPage() {
  return (
    <main className="site-shell location-shell">
      <div className="contact-bar">
        <div className="contact-content">
          <span className="contact-item">Tel: +216 99 11 00 12</span>
          <span className="contact-item">Adresse: Ennasr 2</span>
        </div>
        <div className="social-icons">
          <a href="https://bisklet.com/" aria-label="Facebook">
            f
          </a>
          <a href="https://bisklet.com/" aria-label="Instagram">
            in
          </a>
          <a href="mailto:contact@bisklet.com" aria-label="Email">
            @
          </a>
        </div>
      </div>

      <header className="topbar">
        <a className="brand" href="/" aria-label="Bisklet accueil">
          <span className="brand-logo">B</span>
          <span className="brand-name">Bisklet</span>
        </a>

        <nav className="topnav" aria-label="Navigation principale">
          <a href="/accueil.html">ACCUEIL</a>
          <a href="/location.html">LOCATION</a>
          <a href="/boutique.html">BOUTIQUE</a>
          <a href="/my-account.html">MY ACCOUNT</a>
          <AdminNavLink />
        </nav>

        <div className="top-actions">
          <a className="login-link" href="/login.html">
            Login
          </a>
          <a className="register-link" href="/register.html">
            Register
          </a>
          <a className="booking-btn" href="/location-offres.html">
            Booking
          </a>
        </div>
      </header>

      <section className="location-hero">
        <div className="location-hero-copy">
          <span className="section-kicker">Location Bisklet</span>
          <h1>Louez votre velo ou trottinette pour explorer la ville.</h1>
          <p>
            Bisklet propose des trottinettes electriques, trottinettes
            classiques, city bikes et mountain bikes pour une mobilite urbaine
            simple, rapide et durable.
          </p>
          <div className="hero-cta">
            <a
              className="primary-link accueil-button"
              href="/location-offres.html"
            >
              Voir les offres
            </a>
            <a
              className="secondary-link accueil-button"
              href="/location-comment-ca-marche.html"
            >
              Comment ca marche
            </a>
          </div>
        </div>
        <div className="location-hero-media">
          <img src={heroImage} alt="Location Bisklet" loading="eager" />
          <div className="location-badge">Location & Vente</div>
        </div>
      </section>

      <section className="location-benefits">
        {benefits.map((benefit) => (
          <article className="location-benefit-card" key={benefit.title}>
            <img src={benefit.image} alt={benefit.title} loading="lazy" />
            <h3>{benefit.title}</h3>
            <p>{benefit.text}</p>
          </article>
        ))}
      </section>

      <section className="location-booking" id="booking-location">
        <div className="section-header">
          <span className="section-kicker">Booking</span>
          <h2>Choisissez votre solution de location</h2>
          <p>
            Les offres Bisklet reprennent les services presentes sur le site :
            trottinettes, city bike et mountain bike.
          </p>
        </div>

        <div className="rental-grid">
          {rentalItems.map((item) => (
            <article className="rental-card" key={item.title}>
              <div className="rental-image">
                <img src={item.image} alt={item.title} loading="lazy" />
              </div>
              <div className="rental-copy">
                <h3>{item.title}</h3>
                <ul>
                  {item.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                <a
                  className="primary-link accueil-button"
                  href="/location-offres.html"
                >
                  Book
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="location-steps-section" id="location-steps">
        <div className="location-steps-copy">
          <span className="section-kicker">Comment ca marche</span>
          <h2>Un parcours clair du booking jusqu'a la restitution.</h2>
          <p>
            La location Bisklet est pensee pour vous laisser plus de temps pour
            rouler, visiter et profiter.
          </p>
        </div>
        <div className="location-step-list">
          {locationSteps.map((step, index) => (
            <div className="location-step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="location-contact" id="location-contact">
        <div>
          <span className="section-kicker">Reservation</span>
          <h2>Appelez-nous pour reserver votre Bisklet.</h2>
          <p>Adresse: Ennasr 2 · Mobile: +216 99 11 00 12</p>
        </div>
        <a
          className="primary-link accueil-button"
          href="mailto:contact@bisklet.com"
        >
          contact@bisklet.com
        </a>
      </section>
    </main>
  );
}

export default LocationPage;
