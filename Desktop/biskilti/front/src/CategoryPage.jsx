import "./App.css";

import { categories } from "./categoryData.js";

function CategoryPage({ type }) {
  const category = categories[type];

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
        </nav>
      </header>

      <section className="category-detail-hero">
        <div>
          <span className="section-kicker">{category.kicker}</span>
          <h1>{category.title}</h1>
          <p>{category.text}</p>
          <a className="primary-link accueil-button" href="mailto:contact@bisklet.com">
            Demander plus d'informations
          </a>
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
