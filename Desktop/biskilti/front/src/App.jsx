import "./App.css";

import heroImage from "./assets/hero.png";
import txSellImage from "./assets/tx-sell.svg";
import txBuyImage from "./assets/tx-buy.svg";
import txExchangeImage from "./assets/tx-exchange.svg";
import catBikesImage from "./assets/cat-bikes.svg";
import catPartsImage from "./assets/cat-parts.svg";
import catAccessoriesImage from "./assets/cat-accessories.svg";
import catAdsImage from "./assets/cat-ads.svg";
import featSecureImage from "./assets/feat-secure.svg";
import featFastImage from "./assets/feat-fast.svg";
import featLocalImage from "./assets/feat-local.svg";
import { AdminNavLink } from "./SessionNav.jsx";

const transactions = [
  {
    icon: "V",
    title: "Vendre",
    image: txSellImage,
    description:
      "Publiez rapidement votre velo, pieces ou accessoires. Touchez des acheteurs serieux et concluez en confiance.",
    action: "Vendre maintenant",
    href: "/vendre.html",
  },
  {
    icon: "A",
    title: "Acheter",
    image: txBuyImage,
    description:
      "Explorez des offres qualifiees. Filtrez par prix, localisation et etat pour trouver exactement ce qu'il vous faut.",
    action: "Explorer",
    href: "/explorer.html",
  },
  {
    icon: "E",
    title: "Echanger",
    image: txExchangeImage,
    description:
      "Echangez directement avec d'autres utilisateurs. Transformez vos anciens equipements en nouvelles opportunites.",
    action: "Proposer un echange",
    href: "/echange.html",
  },
];

const categories = [
  {
    title: "Velos & VAE",
    description: "VTT, velos de ville, electriques et modeles premium.",
    image: catBikesImage,
    href: "/categorie-velos.html",
  },
  {
    title: "Pieces de rechange",
    description: "Transmission, freins, pneus, batteries et consommables.",
    image: catPartsImage,
    href: "/categorie-pieces.html",
  },
  {
    title: "Accessoires",
    description: "Casques, antivols, sacoches, eclairage et equipement.",
    image: catAccessoriesImage,
    href: "/categorie-accessoires.html",
  },
  {
    title: "Petites annonces",
    description: "Tous types d'annonces velo et mobilite douce.",
    image: catAdsImage,
    href: "/categorie-annonces.html",
  },
];

const features = [
  {
    title: "Securise",
    description:
      "Messagerie protegee, verification des utilisateurs et parcours d'achat plus rassurant.",
    image: featSecureImage,
  },
  {
    title: "Rapide",
    description:
      "Publiez en quelques minutes, trouvez rapidement et contactez le bon vendeur sans complexite.",
    image: featFastImage,
  },
  {
    title: "Local",
    description:
      "Recherche locale pour identifier les vendeurs, ateliers et offres proches de chez vous.",
    image: featLocalImage,
  },
];

function App() {
  return (
    <main className="site-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <div className="contact-bar">
        <div className="contact-content">
          <span className="contact-item">Tel: +216 99 11 00 12</span>
          <span className="contact-item">Adresse: Ennasr 2</span>
        </div>
        <div className="social-icons">
          <a href="#" aria-label="Facebook">
            f
          </a>
          <a href="#" aria-label="Instagram">
            in
          </a>
          <a href="#" aria-label="Email">
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
          <a className="booking-btn" href="#transactions">
            Booking
          </a>
        </div>
      </header>

      <section className="hero" id="hero">
        <div className="hero-content">
          <h1>La plateforme professionnelle pour velos et mobilite douce</h1>
          <p>
            Achetez, vendez et echangez en toute confiance. Simple, rapide et
            securise.
          </p>
          <div className="hero-cta">
            <a className="primary-link btn-premium" href="#transactions">
              Commencer maintenant
            </a>
            <a className="secondary-link btn-premium" href="#features">
              En savoir plus
            </a>
          </div>
        </div>
        <div className="hero-image">
          <img
            className="hero-photo"
            src={heroImage}
            alt="Illustration premium Bisklet"
            loading="eager"
          />
        </div>
      </section>

      <section className="transactions-section" id="transactions">
        <div className="section-header">
          <h2>Choisissez votre action</h2>
          <p>
            Bisklet s'adapte a votre besoin : vendre, acheter ou echanger
            simplement.
          </p>
        </div>

        <div className="transactions-grid">
          {transactions.map((tx) => (
            <article className="transaction-card card-hover" key={tx.title}>
              <div className="card-image">
                <img
                  className="card-photo"
                  src={tx.image}
                  alt={`Illustration ${tx.title}`}
                  loading="lazy"
                />
              </div>
              <div className="tx-icon">{tx.icon}</div>
              <h3>{tx.title}</h3>
              <p>{tx.description}</p>
              <a href={tx.href} className="tx-button btn-premium">
                {tx.action}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="categories-section" id="categories">
        <div className="section-header">
          <h2>Explorez nos categories</h2>
          <p>Tout ce dont vous avez besoin pour la mobilite douce</p>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => (
            <a
              className="category-card card-hover"
              href={cat.href}
              key={cat.title}
            >
              <div className="category-icon">
                <img
                  className="category-photo"
                  src={cat.image}
                  alt={`Categorie ${cat.title}`}
                  loading="lazy"
                />
              </div>
              <h3>{cat.title}</h3>
              <p>{cat.description}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-header">
          <h2>Pourquoi Bisklet ?</h2>
          <p>Une plateforme pensee pour vous</p>
        </div>

        <div className="features-grid">
          {features.map((feat) => (
            <div className="feature-card card-hover" key={feat.title}>
              <div className="feature-badge">
                <img
                  className="feature-photo"
                  src={feat.image}
                  alt={`Avantage ${feat.title}`}
                  loading="lazy"
                />
              </div>
              <h3>{feat.title}</h3>
              <p>{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section" id="contact">
        <div className="cta-content">
          <h2>Pret a commencer ?</h2>
          <p>Rejoignez la communaute Bisklet aujourd'hui</p>
          <div className="cta-buttons">
            <a href="/register.html" className="primary-link btn-premium">
              Creer un compte
            </a>
            <a href="/location-offres.html" className="secondary-link btn-premium">
              Nous contacter
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>A propos</h4>
            <a href="#">Qui sommes-nous</a>
            <a href="#">Blog</a>
            <a href="#">Carrieres</a>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <a href="#">Centre d'aide</a>
            <a href="#">Contact</a>
            <a href="#">FAQ</a>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <a href="#">Conditions</a>
            <a href="#">Confidentialite</a>
            <a href="#">Cookies</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Bisklet. Tous droits reserves.</p>
        </div>
      </footer>
    </main>
  );
}

export default App;
