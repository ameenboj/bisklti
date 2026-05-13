import "./App.css";

import { boutiqueProducts } from "./boutiqueData.js";

function BoutiqueProductsPage() {
  return (
    <main className="site-shell location-detail-shell">
      <header className="detail-topbar">
        <a className="brand" href="/">
          <span className="brand-logo">B</span>
          <span className="brand-name">Bisklet</span>
        </a>
        <nav className="topnav" aria-label="Navigation boutique">
          <a href="/boutique.html">BOUTIQUE</a>
          <a href="/boutique-guide.html">GUIDE D'ACHAT</a>
          <a href="/location.html">LOCATION</a>
        </nav>
      </header>

      <section className="detail-hero">
        <span className="section-kicker">Produits boutique</span>
        <h1>Catalogue complet des solutions Bisklet.</h1>
        <p>
          Comparez les velos, trottinettes et equipements avant de contacter la
          boutique pour les disponibilites.
        </p>
      </section>

      <section className="offers-detail-grid">
        {boutiqueProducts.map((product) => (
          <article className="offer-detail-card" key={product.title}>
            <div className="offer-detail-image">
              <img src={product.image} alt={product.title} loading="lazy" />
            </div>
            <div>
              <span className="section-kicker">{product.category}</span>
              <h2>{product.title}</h2>
              <div className="product-review-row">
                <strong>{product.rating}</strong>
                <small>{product.reviews}</small>
              </div>
              <p>{product.text}</p>
              <div className="product-price-row">
                <strong className="product-price">{product.price}</strong>
                <del>{product.oldPrice}</del>
                <b>{product.discount}</b>
              </div>
              <div className="product-stock">{product.stock}</div>
              <ul>
                {product.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <a className="primary-link accueil-button" href="mailto:contact@bisklet.com">
                Demander disponibilite
              </a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default BoutiqueProductsPage;
