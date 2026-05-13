import "./App.css";

import { useState } from "react";
import { apiRequest } from "./authClient.js";
import { categories } from "./categoryData.js";
import { AdminNavLink } from "./SessionNav.jsx";

function CategoryPage({ type }) {
  const category = categories[type];
  const [actionMessage, setActionMessage] = useState("");

  const requestInfo = async () => {
    setActionMessage("Envoi de la demande...");

    try {
      const data = await apiRequest("/api/contact-requests", {
        method: "POST",
        body: JSON.stringify({
          topic: category.title,
          message: category.text,
        }),
      });
      setActionMessage(data.message);
    } catch (error) {
      setActionMessage(error.message);
    }
  };

  return (
    <main className="site-shell category-detail-shell">
      <header className="detail-topbar">
        <a className="brand" href="/">
          <span className="brand-logo">B</span>
          <span className="brand-name">Bisklet</span>
        </a>
        <nav className="topnav" aria-label="Navigation categories">
          <a href="/">HOME</a>
          <a href="/location.html">LOCATION</a>
          <a href="/accueil.html">ACCUEIL</a>
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

      <section className="category-detail-hero">
        <div>
          <span className="section-kicker">{category.kicker}</span>
          <h1>{category.title}</h1>
          <p>{category.text}</p>
          <button
            className="primary-link accueil-button"
            type="button"
            onClick={requestInfo}
          >
            Demander plus d'informations
          </button>
          {actionMessage && <div className="action-status">{actionMessage}</div>}
        </div>
        <div className="category-detail-image">
          <img src={category.image} alt={category.title} loading="eager" />
        </div>
      </section>

      <section className="category-detail-points">
        {category.points.map((point, index) => (
          <article className="category-point-card" key={point}>
            <span>{index + 1}</span>
            <p>{point}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default CategoryPage;
