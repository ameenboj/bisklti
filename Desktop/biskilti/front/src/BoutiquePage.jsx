import "./App.css";

import { useMemo, useState } from "react";
import {
  boutiqueBudgetOptions,
  boutiqueFilterGroups,
  boutiqueHighlights,
  boutiqueProducts,
  buyingGuide,
} from "./boutiqueData.js";
import { AdminNavLink } from "./SessionNav.jsx";
import { useBoutiqueProducts } from "./useBoutiqueProducts.js";

const featuredProduct = boutiqueProducts[0];

function getDiscountValue(discount) {
  return Number(String(discount || "").replace("%", "").replace("-", "")) || 0;
}

function productMatchesBudget(product, budget) {
  if (budget === "under-200") {
    return product.priceNumber < 200;
  }

  if (budget === "200-1000") {
    return product.priceNumber >= 200 && product.priceNumber <= 1000;
  }

  if (budget === "1000-2500") {
    return product.priceNumber > 1000 && product.priceNumber <= 2500;
  }

  if (budget === "over-2500") {
    return product.priceNumber > 2500;
  }

  return true;
}

function BoutiquePage() {
  const [actionMessage, setActionMessage] = useState("");
  const [openingProduct, setOpeningProduct] = useState(null);
  const { listingsStatus, products } = useBoutiqueProducts();
  const highlightedProductId = useMemo(
    () => new URLSearchParams(window.location.search).get("annonce"),
    [],
  );
  const [filters, setFilters] = useState({
    category: "Tous",
    useCase: "Tous",
    availability: "Tous",
    budget: "all",
    query: "",
    sort: "promo",
  });

  const filteredProducts = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return products
      .filter((product) => {
        const matchesGroups = boutiqueFilterGroups.every((group) => {
          const selectedValue = filters[group.key];
          return selectedValue === "Tous" || product[group.key] === selectedValue;
        });

        const matchesSearch =
          !query ||
          [product.title, product.category, product.text, ...product.tags]
            .join(" ")
            .toLowerCase()
            .includes(query);

        return (
          matchesGroups &&
          matchesSearch &&
          productMatchesBudget(product, filters.budget)
        );
      })
      .sort((first, second) => {
        if (filters.sort === "promo" && first.isListing !== second.isListing) {
          return first.isListing ? -1 : 1;
        }

        if (filters.sort === "price-low") {
          return first.priceNumber - second.priceNumber;
        }

        if (filters.sort === "price-high") {
          return second.priceNumber - first.priceNumber;
        }

        return getDiscountValue(second.discount) - getDiscountValue(first.discount);
      });
  }, [filters, products]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: "Tous",
      useCase: "Tous",
      availability: "Tous",
      budget: "all",
      query: "",
      sort: "promo",
    });
  };

  const openProductMessage = (product) => {
    const messageProduct = {
      id: product.id,
      title: product.title,
      category: product.category,
      image: product.image,
      price: product.price,
      stock: product.stock,
      badge: product.badge,
    };

    localStorage.setItem(
      "bisklet_pending_message_product",
      JSON.stringify(messageProduct),
    );
    setOpeningProduct(product);
    setActionMessage(`Ouverture de la messagerie pour ${product.title}...`);

    window.setTimeout(() => {
      window.location.assign(
        `/messagerie.html?product=${encodeURIComponent(product.id)}`,
      );
    }, 850);
  };

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

      <section className="boutique-products" id="boutique-products">
        <div className="boutique-section-heading">
          <div>
            <span className="section-kicker">Shop</span>
            <h2>Catalogue boutique</h2>
          </div>
          <p>
            Filtrez rapidement par categorie, usage, budget et disponibilite.
            Chaque fiche affiche la remise directement sur la photo.
          </p>
        </div>
        {actionMessage && <div className="action-status">{actionMessage}</div>}
        {listingsStatus === "error" && (
          <div className="action-status">
            Annonces publiees indisponibles pour le moment.
          </div>
        )}
        {openingProduct && (
          <div className="front-alert" role="status" aria-live="assertive">
            <div className="front-alert-card">
              <span>Messagerie</span>
              <h2>Conversation ouverte</h2>
              <p>
                Vous allez discuter avec le proprietaire pour{" "}
                <strong>{openingProduct.title}</strong>.
              </p>
            </div>
          </div>
        )}

        <div className="boutique-featured-product">
          <div className="featured-copy">
            <span>Produit phare</span>
            <h2>{featuredProduct.title}</h2>
            <p>
              Selection mise en avant avec photo produit, remise claire, prix
              final en DT, disponibilite et avis clients pour aider la decision
              d'achat.
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
            <span className="photo-discount-badge">{featuredProduct.discount}</span>
            <img src={featuredProduct.image} alt={featuredProduct.title} />
          </div>
        </div>

        <div className="shop-layout">
          <aside className="shop-filter-sidebar" aria-label="Filtres produits">
            <div className="filter-sidebar-head">
              <div>
                <span className="section-kicker">Filtres</span>
                <h3>Affiner la boutique</h3>
              </div>
              <button type="button" onClick={resetFilters}>
                Reset
              </button>
            </div>

            <label className="filter-search">
              <span>Recherche produit</span>
              <input
                type="search"
                value={filters.query}
                onChange={(event) => updateFilter("query", event.target.value)}
                placeholder="E-bike, casque, moteur..."
              />
            </label>

            {boutiqueFilterGroups.map((group) => (
              <div className="filter-group" key={group.key}>
                <h4>{group.label}</h4>
                <label className="filter-option">
                  <input
                    checked={filters[group.key] === "Tous"}
                    name={group.key}
                    onChange={() => updateFilter(group.key, "Tous")}
                    type="radio"
                  />
                  <span>Tous</span>
                </label>
                {group.options.map((option) => (
                  <label className="filter-option" key={option}>
                    <input
                      checked={filters[group.key] === option}
                      name={group.key}
                      onChange={() => updateFilter(group.key, option)}
                      type="radio"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ))}

            <div className="filter-group">
              <h4>Budget</h4>
              {boutiqueBudgetOptions.map((option) => (
                <label className="filter-option" key={option.value}>
                  <input
                    checked={filters.budget === option.value}
                    name="budget"
                    onChange={() => updateFilter("budget", option.value)}
                    type="radio"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </aside>

          <div className="shop-results">
            <div className="shop-toolbar">
              <div>
                <strong>{filteredProducts.length} produits / annonces trouves</strong>
                <span>Photos, promos et disponibilite en un regard.</span>
              </div>
              <label>
                <span>Trier</span>
                <select
                  value={filters.sort}
                  onChange={(event) => updateFilter("sort", event.target.value)}
                >
                  <option value="promo">Meilleures promos</option>
                  <option value="price-low">Prix croissant</option>
                  <option value="price-high">Prix decroissant</option>
                </select>
              </label>
            </div>

            <div className="boutique-product-grid">
              {filteredProducts.map((product) => (
                <article
                  className={`boutique-product-card${
                    product.id === highlightedProductId ? " is-highlighted" : ""
                  }`}
                  key={product.id}
                >
                  <div className="boutique-product-image">
                    <span className="photo-discount-badge">
                      {product.discount}
                    </span>
                    <span className="product-photo-badge">{product.badge}</span>
                    <img
                      src={product.image}
                      alt={product.title}
                      loading="lazy"
                    />
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
                      {product.oldPrice && <del>{product.oldPrice}</del>}
                    </div>
                    <div className="product-stock">{product.stock}</div>
                    <div className="product-tags">
                      {(product.tags || []).map((tag) => (
                        <small key={tag}>{tag}</small>
                      ))}
                    </div>
                    <button
                      className="product-buy-button"
                      type="button"
                      onClick={() => openProductMessage(product)}
                    >
                      {product.cta || "Demander disponibilite"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
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
