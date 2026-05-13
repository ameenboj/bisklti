import "./App.css";

import { useState } from "react";
import { apiRequest } from "./authClient.js";
import txSellImage from "./assets/tx-sell.svg";
import txBuyImage from "./assets/tx-buy.svg";
import txExchangeImage from "./assets/tx-exchange.svg";
import { AdminNavLink } from "./SessionNav.jsx";

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

function boutiqueListingUrl(listing) {
  const listingId = listing?.id ? `listing-${listing.id}` : "";

  return listingId
    ? `/boutique.html?annonce=${encodeURIComponent(listingId)}`
    : "/boutique.html";
}

function ActionPage({ type }) {
  const page = actionContent[type];
  const [actionMessage, setActionMessage] = useState("");

  const submitAction = async () => {
    if (type === "explorer") {
      window.location.href = "/boutique-produits.html";
      return;
    }

    setActionMessage("Envoi en cours...");

    try {
      const endpoint = type === "echange" ? "/api/exchanges" : "/api/listings";
      const payload =
        type === "echange"
          ? {
              offered_item: "Equipement a echanger",
              wanted_item: "Velo ou accessoire",
              description: page.text,
            }
          : {
              title: "Nouvelle annonce Bisklet",
              category: "Velo",
              condition: "A verifier",
              location: "Tunis",
              description: page.text,
            };
      const data = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (type === "vendre") {
        setActionMessage(`${data.message} Ouverture de la boutique...`);
        window.setTimeout(() => {
          window.location.assign(boutiqueListingUrl(data.listing));
        }, 700);
        return;
      }

      setActionMessage(data.message);
    } catch (error) {
      setActionMessage(error.message);
    }
  };

  const submitContact = async () => {
    setActionMessage("Envoi du contact...");

    try {
      const data = await apiRequest("/api/contact-requests", {
        method: "POST",
        body: JSON.stringify({
          topic: page.kicker,
          message: page.text,
        }),
      });
      setActionMessage(data.message);
    } catch (error) {
      setActionMessage(error.message);
    }
  };

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

      <section className="action-hero">
        <div>
          <span className="section-kicker">{page.kicker}</span>
          <h1>{page.title}</h1>
          <p>{page.text}</p>
          <button
            className="primary-link accueil-button"
            type="button"
            onClick={submitAction}
          >
            {page.cta}
          </button>
          {actionMessage && <div className="action-status">{actionMessage}</div>}
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
        <button
          className="primary-link accueil-button"
          type="button"
          onClick={submitContact}
        >
          contact@bisklet.com
        </button>
      </section>
    </main>
  );
}

export default ActionPage;
