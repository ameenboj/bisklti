import "./App.css";

import { useMemo, useState } from "react";
import {
  boutiqueBudgetOptions,
  boutiqueFilterGroups,
} from "./boutiqueData.js";
import { AdminNavLink } from "./SessionNav.jsx";
import { useBoutiqueProducts } from "./useBoutiqueProducts.js";

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

function BoutiqueProductsPage() {
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
        <span className="section-kicker">Produits boutique</span>
        <h1>Catalogue boutique avec photos, promos et filtres.</h1>
        <p>
          Comparez les velos, e-bikes, accessoires et pieces avec prix en DT,
          remise visible, avis clients et disponibilite.
        </p>
      </section>

      <section className="boutique-products boutique-products-detail">
        <div className="shop-layout">
          <aside className="shop-filter-sidebar" aria-label="Filtres produits">
            <div className="filter-sidebar-head">
              <div>
                <span className="section-kicker">Filtres</span>
                <h3>Recherche rapide</h3>
              </div>
            </div>

            <label className="filter-search">
              <span>Produit</span>
              <input
                type="search"
                value={filters.query}
                onChange={(event) => updateFilter("query", event.target.value)}
                placeholder="Chercher..."
              />
            </label>

            {boutiqueFilterGroups.map((group) => (
              <div className="filter-group" key={group.key}>
                <h4>{group.label}</h4>
                <label className="filter-option">
                  <input
                    checked={filters[group.key] === "Tous"}
                    name={`products-${group.key}`}
                    onChange={() => updateFilter(group.key, "Tous")}
                    type="radio"
                  />
                  <span>Tous</span>
                </label>
                {group.options.map((option) => (
                  <label className="filter-option" key={option}>
                    <input
                      checked={filters[group.key] === option}
                      name={`products-${group.key}`}
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
                    name="products-budget"
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
                <strong>{filteredProducts.length} produits / annonces</strong>
                <span>Catalogue complet Bisklet.</span>
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
    </main>
  );
}

export default BoutiqueProductsPage;
