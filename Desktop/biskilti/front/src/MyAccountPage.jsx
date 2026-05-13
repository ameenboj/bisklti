import "./App.css";

const profileFields = [
  { label: "Nom", value: "Invité" },
  { label: "Email", value: "—" },
  { label: "Téléphone", value: "—" },
  { label: "Adresse", value: "—" },
];

const activityStats = [
  { value: "0", label: "réservations" },
  { value: "0", label: "commandes" },
  { value: "0", label: "annonces" },
  { value: "0", label: "favoris" },
];

function MyAccountPage() {
  return (
    <main className="site-shell account-shell">
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
        </nav>

        <a className="booking-btn" href="/location-offres.html">
          Booking
        </a>
      </header>

      <section className="detail-hero">
        <span className="section-kicker">My account</span>
        <h1>Votre espace personnel</h1>
        <p>
          Consultez vos informations principales et accédez rapidement aux pages
          clés. (Les données seront remplacées par celles de votre compte après
          connexion.)
        </p>
      </section>

      <section className="transactions-section">
        <div className="section-header">
          <h2>Aperçu du compte</h2>
          <p>Un résumé clair de votre profil, activité et actions rapides.</p>
        </div>

        <div className="transactions-grid" aria-label="Panneaux du compte">
          <article className="transaction-card card-hover account-card">
            <div className="tx-icon" aria-hidden="true">
              P
            </div>
            <h3>Profil</h3>
            <p>Informations personnelles et coordonnées.</p>
            <ul className="account-fields" aria-label="Informations du profil">
              {profileFields.map((field) => (
                <li className="account-field" key={field.label}>
                  <span>{field.label}</span>
                  <strong>{field.value}</strong>
                </li>
              ))}
            </ul>
          </article>

          <article className="transaction-card card-hover account-card">
            <div className="tx-icon" aria-hidden="true">
              A
            </div>
            <h3>Activité</h3>
            <p>Suivi rapide de vos réservations et contenus.</p>
            <div className="home-stats" aria-label="Statistiques du compte">
              {activityStats.map((stat) => (
                <div className="home-stat" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="transaction-card card-hover account-card">
            <div className="tx-icon" aria-hidden="true">
              R
            </div>
            <h3>Actions rapides</h3>
            <p>Accédez directement aux fonctionnalités principales.</p>
            <div className="account-actions" aria-label="Actions rapides">
              <a
                className="primary-link btn-premium"
                href="/location-offres.html"
              >
                Voir les offres de location
              </a>
              <a className="secondary-link btn-premium" href="/vendre.html">
                Publier une annonce
              </a>
              <a className="secondary-link btn-premium" href="/explorer.html">
                Explorer les annonces
              </a>
              <a className="ghost-link btn-premium" href="/echange.html">
                Proposer un échange
              </a>
            </div>
            <p className="account-note">
              Astuce : après connexion, vous verrez votre profil réel et votre
              historique.
            </p>
          </article>
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

export default MyAccountPage;
