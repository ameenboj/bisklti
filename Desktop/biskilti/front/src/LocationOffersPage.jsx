import "./App.css";

import { useState } from "react";
import { apiRequest, getCustomerPayload } from "./authClient.js";
import { rentalItems } from "./locationData.js";
import { AdminNavLink } from "./SessionNav.jsx";

function LocationOffersPage() {
  const [actionMessage, setActionMessage] = useState("");

  const bookRental = async (item) => {
    setActionMessage("Creation du booking...");

    try {
      const data = await apiRequest("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          rental_title: item.title,
          notes: item.text,
          ...getCustomerPayload(),
        }),
      });
      setActionMessage(data.message);
    } catch (error) {
      setActionMessage(error.message);
    }
  };

  return (
    <main className="site-shell location-detail-shell">
      <header className="detail-topbar">
        <a className="brand" href="/">
          <span className="brand-logo">B</span>
          <span className="brand-name">Bisklet</span>
        </a>
        <nav className="topnav" aria-label="Navigation location">
          <a href="/location.html">LOCATION</a>
          <a href="/location-comment-ca-marche.html">COMMENT CA MARCHE</a>
          <a href="mailto:contact@bisklet.com">CONTACT</a>
          <AdminNavLink />
        </nav>
        <div className="top-actions">
          <a className="login-link" href="/login.html">
            Login
          </a>
          <a className="register-link" href="/register.html">
            Register
          </a>
        </div>
      </header>

      <section className="detail-hero">
        <span className="section-kicker">Voir les offres</span>
        <h1>Choisissez votre Bisklet et reservez en confiance.</h1>
        <p>
          Retrouvez les offres de location presentees par Bisklet : trottinette
          electrique, trottinette classique, city bike et mountain bike.
        </p>
      </section>

      <section className="offers-detail-grid">
        {actionMessage && <div className="action-status">{actionMessage}</div>}
        {rentalItems.map((item) => (
          <article className="offer-detail-card" key={item.title}>
            <div className="offer-detail-image">
              <img src={item.image} alt={item.title} loading="lazy" />
            </div>
            <div>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
              <ul>
                {item.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <button
                className="primary-link accueil-button"
                type="button"
                onClick={() => bookRental(item)}
              >
                Book maintenant
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="location-contact detail-contact">
        <div>
          <span className="section-kicker">Besoin d'aide ?</span>
          <h2>Appelez-nous au +216 99 11 00 12.</h2>
          <p>Adresse: Ennasr 2 · E-mail: contact@bisklet.com</p>
        </div>
        <a className="primary-link accueil-button" href="/location-comment-ca-marche.html">
          Voir les etapes
        </a>
      </section>
    </main>
  );
}

export default LocationOffersPage;
