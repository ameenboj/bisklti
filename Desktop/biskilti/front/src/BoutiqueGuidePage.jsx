import "./App.css";

import { boutiqueHighlights, buyingGuide } from "./boutiqueData.js";

function BoutiqueGuidePage() {
  return (
    <main className="site-shell location-detail-shell">
      <header className="detail-topbar">
        <a className="brand" href="/">
          <span className="brand-logo">B</span>
          <span className="brand-name">Bisklet</span>
        </a>
        <nav className="topnav" aria-label="Navigation boutique">
          <a href="/boutique.html">BOUTIQUE</a>
          <a href="/boutique-produits.html">PRODUITS</a>
          <a href="/location.html">LOCATION</a>
        </nav>
      </header>

      <section className="detail-hero">
        <span className="section-kicker">Guide d'achat</span>
        <h1>Choisir le bon equipement selon votre usage.</h1>
        <p>
          Ce guide aide les clients a choisir entre trottinette, city bike,
          mountain bike et accessoires.
        </p>
      </section>

      <section className="boutique-buying-guide detail-guide-section">
        <div className="buying-guide-grid">
          {buyingGuide.map((item, index) => (
            <article className="buying-guide-card" key={item.title}>
              <span>{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="how-benefit-grid guide-benefits">
        {boutiqueHighlights.map((item) => (
          <article className="how-benefit-card" key={item.title}>
            <img src={item.image} alt={item.title} loading="lazy" />
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default BoutiqueGuidePage;
