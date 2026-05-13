import "./App.css";

import { AdminNavLink } from "./SessionNav.jsx";

const desertImage = "/gallery/ebike-desert-rider.jpg";
const lakeSunsetImage = "/gallery/ebike-lake-sunset.jpg";
const motorImage = "/gallery/ebike-motor-repair.jpg";
const lakeRideImage = "/gallery/ebike-lake-ride.jpg";
const forestRideImage = "/gallery/bike-forest-rider.webp";

const homeStats = [
  { value: "2019", label: "centre velo inaugure a Tunis" },
  { value: "10h-19h", label: "ouvert du lundi au dimanche" },
  { value: "Mutuelleville", label: "16 Avenue Tahar Ben Achour" },
];

const homeHighlights = [
  {
    title: "Centre d'informations",
    text: "Dar Bisklette accompagne les cyclistes avec des conseils, des rencontres et des informations utiles pour rouler en ville.",
    image: lakeSunsetImage,
  },
  {
    title: "Atelier velo",
    text: "Un espace pour reparer, apprendre les bases de l'entretien et mieux comprendre son velo au quotidien.",
    image: motorImage,
  },
  {
    title: "Culture et communaute",
    text: "Bibliotheque, projections, conferences et sorties reunissent les passionnes de mobilite douce.",
    image: forestRideImage,
  },
];

const serviceCards = [
  {
    title: "Location de velos",
    text: "Dar Bisklette propose un service de location pour decouvrir Tunis autrement et encourager les deplacements doux.",
    image: lakeSunsetImage,
  },
  {
    title: "Atelier de reparation",
    text: "Des ateliers pour entretenir son velo, reparer les petites pannes et gagner en autonomie.",
    image: motorImage,
  },
  {
    title: "Cours velo",
    text: "Des cours pour adultes et enfants afin de prendre confiance et apprendre les bons reflexes.",
    image: lakeRideImage,
  },
  {
    title: "Sorties guidees",
    text: "Des circuits cyclotourisme pour explorer la ville, son patrimoine, ses parcs et ses quartiers.",
    image: forestRideImage,
  },
];

const whyCards = [
  {
    title: "Mobilite durable",
    text: "Le projet encourage le velo comme moyen de transport propre, pratique et accessible en ville.",
  },
  {
    title: "Lieu de rencontre",
    text: "Dar Bisklette rassemble les usagers, les associations et les curieux autour de la culture velo.",
  },
  {
    title: "Apprentissage",
    text: "Les ateliers, cours et activites aident chacun a devenir plus autonome et confiant a velo.",
  },
];

const steps = [
  "Passez a Dar Bisklette a Mutuelleville.",
  "Choisissez une activite : atelier, location, cours ou sortie.",
  "Discutez avec l'equipe et preparez votre velo ou votre parcours.",
  "Profitez de Tunis a velo avec une approche simple et durable.",
];

const circuits = [
  "Medina de Tunis",
  "Belvedere",
  "Lac de Tunis",
  "Carthage",
];

function AccueilPage() {
  return (
    <main className="site-shell accueil-shell">
      <div className="contact-bar">
        <div className="contact-content">
          <span className="contact-item">Tel: +216 28 366 652</span>
          <span className="contact-item">
            Adresse: 16 Avenue Tahar Ben Achour, Tunis Mutuelleville
          </span>
        </div>
        <div className="social-icons">
          <a href="https://www.facebook.com/VeloruTioN.Tunisienne" aria-label="Facebook">
            f
          </a>
          <a href="mailto:equipe@velorutiontunisie.com" aria-label="Email">
            @
          </a>
        </div>
      </div>

      <header className="topbar">
        <a className="brand" href="/accueil.html" aria-label="Bisklet accueil">
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
          <a className="booking-btn" href="#contact-accueil">
            Booking
          </a>
        </div>
      </header>

      <section className="accueil-hero">
        <div className="hero-content">
          <span className="hero-kicker">Dar Bisklette</span>
          <h1>La maison du velo et de la mobilite douce a Tunis</h1>
          <p>
            Dar Bisklette est un centre dedie a la culture du velo : location,
            atelier de reparation, bibliotheque, cours, conferences et sorties
            cyclotourisme pour decouvrir Tunis autrement.
          </p>
          <div className="hero-cta">
            <a className="primary-link accueil-button" href="#services-accueil">
              Decouvrir les services
            </a>
            <a className="secondary-link accueil-button" href="#contact-accueil">
              Nous contacter
            </a>
          </div>
          <div className="home-stats" aria-label="Informations Dar Bisklette">
            {homeStats.map((stat) => (
              <div className="home-stat" key={stat.value}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="accueil-hero-visual">
          <img
            className="accueil-main-photo"
            src={desertImage}
            alt="Cycliste en velo electrique dans un paysage desertique"
            loading="eager"
          />
          <div className="floating-photo floating-photo-one">
            <img src={lakeSunsetImage} alt="Velo electrique au bord du lac" />
          </div>
          <div className="floating-photo floating-photo-two">
            <img src={motorImage} alt="Moteur de velo electrique" />
          </div>
        </div>
      </section>

      <section className="home-info" aria-label="Presentation">
        <div className="home-info-content">
          <div>
            <span className="section-kicker">Notre mission</span>
            <h2>
              Developper la culture du velo et rendre la ville plus accessible.
            </h2>
          </div>
          <div className="home-info-panel accueil-info-grid">
            {homeHighlights.map((item) => (
              <article className="accueil-info-card" key={item.title}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="accueil-services" id="services-accueil">
        <div className="section-header">
          <span className="section-kicker">Informations avec photos</span>
          <h2>Services, ateliers et experiences velo</h2>
          <p>
            Les activites de Dar Bisklette restent presentees dans le meme style
            que vos pages actuelles, avec les informations et photos recuperees.
          </p>
        </div>

        <div className="accueil-service-grid">
          {serviceCards.map((service) => (
            <article className="accueil-service-card" key={service.title}>
              <div className="accueil-service-image">
                <img src={service.image} alt={service.title} loading="lazy" />
              </div>
              <div className="accueil-service-copy">
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <a className="text-action" href="#contact-accueil">
                  Explorer
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="accueil-why">
        <div className="section-header">
          <span className="section-kicker">Pourquoi Dar Bisklette ?</span>
          <h2>Un lieu pense pour la ville, la communaute et la planete</h2>
        </div>
        <div className="accueil-why-grid">
          {whyCards.map((card) => (
            <article className="accueil-why-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="accueil-process">
        <div className="accueil-process-copy">
          <span className="section-kicker">Comment ca marche</span>
          <h2>Venez, choisissez une activite, roulez.</h2>
          <p>
            Dar Bisklette fonctionne comme un point de contact simple pour les
            cyclistes, les debutants et les visiteurs qui veulent decouvrir
            Tunis a velo.
          </p>
        </div>
        <div className="accueil-steps">
          {steps.map((step, index) => (
            <div className="accueil-step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="accueil-circuits">
        <div className="section-header">
          <span className="section-kicker">Cyclotourisme</span>
          <h2>Explorez Tunis autrement avec des guides locaux</h2>
          <p>
            Des circuits autour du patrimoine, de la nature et des quartiers de
            Tunis pour vivre la ville a velo.
          </p>
        </div>
        <div className="circuit-grid">
          {circuits.map((circuit) => (
            <article className="circuit-card" key={circuit}>
              <span>Circuit</span>
              <h3>{circuit}</h3>
              <a className="text-action" href="#contact-accueil">
                Bookez
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="accueil-final" id="contact-accueil">
        <div>
          <span className="section-kicker">Contact</span>
          <h2>
            Appelez Dar Bisklette au +216 28 366 652 ou passez a Mutuelleville.
          </h2>
        </div>
        <a className="primary-link accueil-button" href="tel:+21628366652">
          Appeler maintenant
        </a>
      </section>
    </main>
  );
}

export default AccueilPage;
