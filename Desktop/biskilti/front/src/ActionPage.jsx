import "./App.css";

import txSellImage from "./assets/tx-sell.svg";
import txBuyImage from "./assets/tx-buy.svg";
import txExchangeImage from "./assets/tx-exchange.svg";

const actionContent = {
  vendre: {
    kicker: "Vendre maintenant",
    title: "Publiez votre velo, pieces ou accessoires avec une annonce claire.",
    text: "Preparez une fiche professionnelle avec photos, prix, etat, localisation et informations utiles pour aider les acheteurs a vous contacter rapidement.",
    image: txSellImage,
    steps: [
      "Ajoutez des photos propres et visibles.",
      "Indiquez le prix, l'etat et la localisation.",
      "Publiez l'annonce et repondez aux acheteurs serieux.",
    ],
    cta: "Creer une annonce",
  },
  explorer: {
    kicker: "Explorer",
    title: "Trouvez rapidement les offres qui correspondent a votre besoin.",
    text: "Explorez les velos, pieces, accessoires et annonces disponibles avec une presentation simple pour comparer plus facilement.",
    image: txBuyImage,
    steps: [
      "Choisissez une categorie.",
      "Comparez les prix, l'etat et la localisation.",
      "Contactez le vendeur ou preparez votre booking.",
    ],
    cta: "Voir les offres",
  },
  echange: {
    kicker: "Proposer un echange",
    title: "Transformez vos anciens equipements en nouvelle opportunite.",
    text: "Proposez un echange clair avec les informations importantes : objet propose, objet recherche, et conditions de rencontre.",
    image: txExchangeImage,
    steps: [
      "Presentez ce que vous proposez.",
      "Expliquez ce que vous recherchez.",
      "Organisez l'echange avec un contact direct et clair.",
    ],
    cta: "Proposer un echange",
  },
};

function ActionPage({ type }) {
  const page = actionContent[type];

  return (
    <main className="site-shell action-shell">
      <header className="detail-topbar">
        <a className="brand" href="/">
          <span className="brand-logo">B</span>
          <span className="brand-name">Bisklet</span>
        </a>
        <nav className="topnav" aria-label="Navigation actions">
          <a href="/accueil.html">ACCUEIL</a>
          <a href="/location.html">LOCATION</a>
          <a href="/">HOME</a>
        </nav>
      </header>

      <section className="action-hero">
        <div>
          <span className="section-kicker">{page.kicker}</span>
          <h1>{page.title}</h1>
          <p>{page.text}</p>
          <a className="primary-link accueil-button" href="mailto:contact@bisklet.com">
            {page.cta}
          </a>
        </div>
        <div className="action-visual">
          <img src={page.image} alt={page.kicker} loading="eager" />
        </div>
      </section>

      <section className="action-steps">
        {page.steps.map((step, index) => (
          <article className="action-step-card" key={step}>
            <span>{index + 1}</span>
            <p>{step}</p>
          </article>
        ))}
      </section>

      <section className="location-contact detail-contact">
        <div>
          <span className="section-kicker">Contact</span>
          <h2>Besoin d'aide ? Contactez Bisklet.</h2>
          <p>Adresse: Ennasr 2 · Mobile: +216 99 11 00 12</p>
        </div>
        <a className="primary-link accueil-button" href="mailto:contact@bisklet.com">
          contact@bisklet.com
        </a>
      </section>
    </main>
  );
}

export default ActionPage;
