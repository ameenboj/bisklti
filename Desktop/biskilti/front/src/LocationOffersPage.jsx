import "./App.css";

import { rentalItems } from "./locationData.js";

function LocationOffersPage() {
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
        </nav>
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
              <a className="primary-link accueil-button" href="mailto:contact@bisklet.com">
                Book maintenant
              </a>
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
