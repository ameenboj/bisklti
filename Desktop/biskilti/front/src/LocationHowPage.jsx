import "./App.css";

import { benefits, locationSteps } from "./locationData.js";

function LocationHowPage() {
  return (
    <main className="site-shell location-detail-shell">
      <header className="detail-topbar">
        <a className="brand" href="/">
          <span className="brand-logo">B</span>
          <span className="brand-name">Bisklet</span>
        </a>
        <nav className="topnav" aria-label="Navigation location">
          <a href="/location.html">LOCATION</a>
          <a href="/location-offres.html">VOIR LES OFFRES</a>
          <a href="mailto:contact@bisklet.com">CONTACT</a>
        </nav>
      </header>

      <section className="detail-hero">
        <span className="section-kicker">Comment ca marche</span>
        <h1>Un parcours simple pour reserver, rouler et restituer.</h1>
        <p>
          Bisklet rend la location plus claire : inscription, point de location,
          booking, trajet et restitution.
        </p>
      </section>

      <section className="how-detail-layout">
        <div className="how-step-stack">
          {locationSteps.map((step, index) => (
            <article className="how-detail-step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>

        <div className="how-benefit-grid">
          {benefits.map((benefit) => (
            <article className="how-benefit-card" key={benefit.title}>
              <img src={benefit.image} alt={benefit.title} loading="lazy" />
              <h2>{benefit.title}</h2>
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="location-contact detail-contact">
        <div>
          <span className="section-kicker">Pret a partir ?</span>
          <h2>Selectionnez une offre et commencez votre booking.</h2>
          <p>Location disponible pour trottinettes, city bikes et mountain bikes.</p>
        </div>
        <a className="primary-link accueil-button" href="/location-offres.html">
          Voir les offres
        </a>
      </section>
    </main>
  );
}

export default LocationHowPage;
