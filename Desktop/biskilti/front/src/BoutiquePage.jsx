import "./App.css";

import {
  boutiqueHighlights,
  boutiqueProducts,
  buyingGuide,
} from "./boutiqueData.js";

const boutiqueStats = [
  { value: "-14%", label: "promos selection boutique" },
  { value: "4.8/5", label: "avis clients moyens" },
  { value: "DT", label: "prix en dinar tunisien" },
];

const featuredProduct = boutiqueProducts[0];

function BoutiquePage() {
  return (
    <main className="site-shell boutique-shell">
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
        </nav>

        <a className="booking-btn" href="/location-offres.html">
          Booking
        </a>
      </header>

      <section className="boutique-hero boutique-hero-redesign">
        <div className="boutique-hero-copy">
          <span className="section-kicker">Boutique velo premium</span>
          <h1>
            Prix clairs, promos visibles et equipements prets a rouler.
          </h1>
          <p>
            Comparez les velos, e-bikes et pieces avec des prix en DT, remises,
            avis clients, disponibilite et photos produits lisibles comme une
            vraie boutique specialisee.
          </p>
          <div className="hero-cta">
            <a
              className="primary-link accueil-button"
              href="/boutique-produits.html"
            >
              Voir les produits
            </a>
            <a
              className="secondary-link accueil-button"
              href="/boutique-guide.html"
            >
              Guide d'achat
            </a>
          </div>
          <div className="boutique-stats">
            {boutiqueStats.map((stat) => (
              <div className="boutique-stat" key={stat.value}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="boutique-hero-gallery">
          <img
            className="boutique-main-bike"
            src={featuredProduct.image}
            alt={featuredProduct.title}
          />
          <div className="boutique-price-float one">
            <span>{featuredProduct.discount}</span>
            <strong>{featuredProduct.price}</strong>
          </div>
          <div className="boutique-price-float two">
            <span>{featuredProduct.rating}</span>
            <strong>{featuredProduct.reviews}</strong>
          </div>
        </div>
      </section>

      <section className="boutique-products" id="boutique-products">
        <div className="boutique-section-heading">
          <div>
            <span className="section-kicker">Collection</span>
            <h2>Catalogue boutique</h2>
          </div>
          <p>
            Inspirez-vous d'une boutique velo moderne : prix fort, prix promo,
            avis, disponibilite et appel a l'action sont visibles en un regard.
          </p>
        </div>

        <div className="boutique-featured-product">
          <div className="featured-copy">
            <span>Produit phare</span>
            <h2>{featuredProduct.title}</h2>
            <p>
              Notre selection met en avant les produits les plus demandes avec
              un prix clair en dinar tunisien, une remise visible et des avis
              clients pour aider la decision d'achat.
            </p>
            <div className="featured-price-row">
              <strong>{featuredProduct.price}</strong>
              <del>{featuredProduct.oldPrice}</del>
              <span>{featuredProduct.discount}</span>
            </div>
            <div className="featured-list">
              <span>{featuredProduct.rating}</span>
              <span>{featuredProduct.reviews}</span>
              <span>{featuredProduct.stock}</span>
              <span>Garantie boutique</span>
            </div>
          </div>
          <div className="featured-media">
            <img src={featuredProduct.image} alt={featuredProduct.title} />
          </div>
        </div>

        <div className="section-header boutique-mobile-title">
          <span className="section-kicker">Collection</span>
          <h2>Produits et services disponibles</h2>
          <p>
            Une structure claire pour comparer les solutions Bisklet et choisir
            le bon equipement.
          </p>
        </div>

        <div className="boutique-product-grid">
          {boutiqueProducts.map((product) => (
            <article className="boutique-product-card" key={product.title}>
              <div className="boutique-product-image">
                <img src={product.image} alt={product.title} loading="lazy" />
              </div>
              <div className="boutique-product-copy">
                <span>{product.category}</span>
                <h3>{product.title}</h3>
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
                <div className="product-tags">
                  {product.tags.map((tag) => (
                    <small key={tag}>{tag}</small>
                  ))}
                </div>
                <a className="product-buy-button" href="/boutique-produits.html">
                  Voir l'offre
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="boutique-guide" id="boutique-guide">
        <div className="boutique-guide-copy">
          <span className="section-kicker">Guide boutique</span>
          <h2>Pourquoi choisir les produits Bisklet ?</h2>
          <p>
            La boutique met en avant des solutions pratiques pour reduire
            l'empreinte carbone, faciliter les trajets courts et soutenir un
            mode de vie actif.
          </p>
        </div>
        <div className="boutique-highlight-grid">
          {boutiqueHighlights.map((item, index) => (
            <article className="boutique-highlight-card" key={item.title}>
              <div className="highlight-index">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="highlight-copy">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
              <div className="highlight-image">
                <img src={item.image} alt={item.title} loading="lazy" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="boutique-buying-guide">
        <div className="section-header">
          <span className="section-kicker">Guide de choix</span>
          <h2>Quel produit choisir ?</h2>
          <p>
            Une structure simple pour aider chaque client a choisir selon son
            usage : trajet court, ville, circuit ou equipement.
          </p>
        </div>
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

      <section className="boutique-final">
        <div>
          <span className="section-kicker">Commencez votre aventure</span>
          <h2>Besoin d'un velo, d'une trottinette ou d'un equipement ?</h2>
          <p>Contact: +216 99 11 00 12 · contact@bisklet.com</p>
        </div>
        <a
          className="primary-link accueil-button"
          href="mailto:contact@bisklet.com"
        >
          Contacter la boutique
        </a>
      </section>
    </main>
  );
}

export default BoutiquePage;
