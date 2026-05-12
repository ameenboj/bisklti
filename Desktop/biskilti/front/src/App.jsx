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

const transactions = [
  {
    icon: "💼",
    title: "Vendre",
    image: txSellImage,
    description:
      "Publiez rapidement votre vélo, pièces ou accessoires. Touchez des acheteurs sincères et concluez en confiance.",
    action: "Vendre maintenant",
  },
  {
    icon: "🛒",
    title: "Acheter",
    image: txBuyImage,
    description:
      "Explorez des milliers d'offres. Filtrez par prix, localisation et état. Trouvez exactement ce qu'il vous faut.",
    action: "Explorer",
  },
  {
    icon: "🔄",
    title: "Échanger",
    image: txExchangeImage,
    description:
      "Échangez directement avec d'autres utilisateurs. Libre et sans frais. Transformez vos anciens équipements.",
    action: "Proposer un échange",
  },
];

const categories = [
  {
    title: "Vélos & VAE",
    description: "VTT, vélos de ville, électriques et modèles premium.",
    image: catBikesImage,
  },
  {
    title: "Pièces de rechange",
    description: "Transmission, freins, pneus, batteries et consommables.",
    image: catPartsImage,
  },
  {
    title: "Accessoires",
    description: "Casques, antivols, sacoches, éclairage et équipement.",
    image: catAccessoriesImage,
  },
  {
    title: "Petites annonces",
    description: "Tous types d'annonces vélo et mobilité douce.",
    image: catAdsImage,
  },
];

const features = [
  {
    title: "Sécurisé",
    description:
      "Messagerie protégée, vérification des utilisateurs et paiement sécurisé.",
    image: featSecureImage,
  },
  {
    title: "Rapide",
    description:
      "Publiez en 2 minutes, trouvez en quelques secondes, échangez en quelques messages.",
    image: featFastImage,
  },
  {
    title: "Local",
    description:
      "Géolocalisation intégrée, trouvez les vendeurs près de chez vous.",
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
          <span className="contact-item">📞 +216 99 11 00 12</span>
          <span className="contact-item">✈️ Ennasr 2</span>
        </div>
        <div className="social-icons">
          <a href="#" aria-label="Facebook">
            f
          </a>
          <a href="#" aria-label="Instagram">
            📷
          </a>
          <a href="#" aria-label="Email">
            ✉️
          </a>
        </div>
      </div>

      <header className="topbar">
        <a className="brand" href="#hero" aria-label="Bisklet accueil">
          <span className="brand-logo">🚴</span>
          <span className="brand-name">Bisklet</span>
        </a>

        <nav className="topnav" aria-label="Navigation principale">
          <a href="#hero">ACCUEIL</a>
          <a href="#categories">LOCATION</a>
          <a href="#features">BOUTIQUE</a>
          <a href="#contact">MY ACCOUNT</a>
        </nav>

        <a className="booking-btn" href="#transactions">
          Booking
        </a>
      </header>

      <section className="hero" id="hero">
        <div className="hero-content">
          <h1>La plateforme de confiance pour vélos et mobilité douce</h1>
          <p>
            Achetez, vendez et échangez en toute confiance. Simple, rapide et
            sécurisé.
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
            Bisklet s'adapte à votre besoin : vendre, acheter ou échanger
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
              <a href="#" className="tx-button btn-premium">
                {tx.action} →
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="categories-section" id="categories">
        <div className="section-header">
          <h2>Explorez nos catégories</h2>
          <p>Tout ce dont vous avez besoin pour la mobilité douce</p>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => (
            <div className="category-card card-hover" key={cat.title}>
              <div className="category-icon">
                <img
                  className="category-photo"
                  src={cat.image}
                  alt={`Catégorie ${cat.title}`}
                  loading="lazy"
                />
              </div>
              <h3>{cat.title}</h3>
              <p>{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-header">
          <h2>Pourquoi Bisklet ?</h2>
          <p>Une plateforme pensée pour vous</p>
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
          <h2>Prêt à commencer ?</h2>
          <p>Rejoignez la communauté Bisklet aujourd'hui</p>
          <div className="cta-buttons">
            <a href="#" className="primary-link btn-premium">
              Créer un compte
            </a>
            <a href="#" className="secondary-link btn-premium">
              Nous contacter
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>À propos</h4>
            <a href="#">Qui sommes-nous</a>
            <a href="#">Blog</a>
            <a href="#">Carrières</a>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <a href="#">Centre d'aide</a>
            <a href="#">Contact</a>
            <a href="#">FAQ</a>
          </div>
          <div className="footer-section">
            <h4>Légal</h4>
            <a href="#">Conditions</a>
            <a href="#">Confidentialité</a>
            <a href="#">Cookies</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Bisklet. Tous droits réservés.</p>
        </div>
      </footer>
    </main>
  );
}

export default App;
