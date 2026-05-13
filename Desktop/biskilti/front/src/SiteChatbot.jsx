import { useEffect, useMemo, useRef, useState } from "react";
import { getStoredUser } from "./authClient.js";
import { boutiqueProducts } from "./boutiqueData.js";
import { rentalItems } from "./locationData.js";

const CHAT_STORAGE_KEY = "bisklet_support_chat";

const initialMessages = [
  {
    id: "welcome",
    author: "bot",
    text: "Bonjour, je suis l'assistant Bisklet. Dites-moi ce que vous voulez faire et je vous guide directement vers la bonne action.",
    actions: [
      { label: "Location", href: "/location.html" },
      { label: "Boutique", href: "/boutique.html" },
      { label: "My account", href: "/my-account.html" },
    ],
  },
];

const quickPrompts = [
  "Je veux louer un velo",
  "Quel produit acheter ?",
  "Je veux vendre mon velo",
  "Aide pour mon compte",
];

function ChatbotIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M12 3.5v2.2" />
      <path d="M8.8 3.5h6.4" />
      <path d="M6.7 8.1h10.6c1.6 0 2.9 1.3 2.9 2.9v4.6c0 1.6-1.3 2.9-2.9 2.9H10l-4.2 2v-2H6.7c-1.6 0-2.9-1.3-2.9-2.9V11c0-1.6 1.3-2.9 2.9-2.9Z" />
      <path d="M8.4 12.5h.1" />
      <path d="M15.5 12.5h.1" />
      <path d="M9.4 15.3c1.5.9 3.7.9 5.2 0" />
    </svg>
  );
}

function loadMessages() {
  try {
    const stored = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY));

    if (Array.isArray(stored) && stored.length > 0) {
      return stored;
    }
  } catch {
    return initialMessages;
  }

  return initialMessages;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function productSummary(products) {
  return products
    .slice(0, 3)
    .map((product) => `${product.title} (${product.price}, ${product.stock})`)
    .join("\n");
}

function buildProductAnswer(text) {
  const query = normalize(text);
  const matched = boutiqueProducts.filter((product) => {
    const searchable = normalize(
      [product.title, product.category, product.text, product.useCase, ...product.tags].join(" "),
    );

    return query
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .some((word) => searchable.includes(word));
  });
  const products = matched.length ? matched : boutiqueProducts;

  return {
    text: `Voici les meilleurs choix pour commencer:\n${productSummary(products)}\n\nTu peux ouvrir le catalogue, filtrer par budget, puis demander disponibilite.`,
    actions: [
      { label: "Voir produits", href: "/boutique-produits.html" },
      { label: "Guide achat", href: "/boutique-guide.html" },
      { label: "Messagerie", href: "/messagerie.html" },
    ],
  };
}

function buildRentalAnswer() {
  const options = rentalItems.map((item) => item.title).join(", ");

  return {
    text: `Pour louer, choisis une option puis booke depuis la page offres. Options: ${options}.`,
    actions: [
      { label: "Voir offres", href: "/location-offres.html" },
      { label: "Comment ca marche", href: "/location-comment-ca-marche.html" },
    ],
  };
}

function buildReply(input, user) {
  const text = normalize(input);
  const isAdmin = user?.role === "admin";

  if (text.includes("admin") || text.includes("dashboard")) {
    return isAdmin
      ? {
          text: "Ton compte est admin. Tu peux ouvrir le tableau de bord pour gerer utilisateurs, produits, commandes et analytics.",
          actions: [{ label: "Admin", href: "/admin-dashboard.html" }],
        }
      : {
          text: "Le dashboard admin apparait seulement avec un compte role admin. Connecte-toi d'abord avec un compte autorise.",
          actions: [
            { label: "Login", href: "/login.html" },
            { label: "My account", href: "/my-account.html" },
          ],
        };
  }

  if (
    text.includes("rent") ||
    text.includes("louer") ||
    text.includes("location") ||
    text.includes("booking") ||
    text.includes("book") ||
    text.includes("trottinette")
  ) {
    return buildRentalAnswer();
  }

  if (
    text.includes("buy") ||
    text.includes("shop") ||
    text.includes("boutique") ||
    text.includes("product") ||
    text.includes("produit") ||
    text.includes("price") ||
    text.includes("prix") ||
    text.includes("velo") ||
    text.includes("bike")
  ) {
    return buildProductAnswer(input);
  }

  if (
    text.includes("sell") ||
    text.includes("vendre") ||
    text.includes("annonce") ||
    text.includes("listing")
  ) {
    return {
      text: "Pour vendre, connecte-toi, ouvre My Account, puis cree une annonce avec titre, categorie, prix, photo et description.",
      actions: [
        { label: "Vendre", href: "/vendre.html" },
        { label: "My account", href: "/my-account.html" },
      ],
    };
  }

  if (
    text.includes("account") ||
    text.includes("compte") ||
    text.includes("login") ||
    text.includes("register") ||
    text.includes("password") ||
    text.includes("pass")
  ) {
    return {
      text: user
        ? `Tu es connecte avec ${user.email}. Ouvre My Account pour voir profil, commandes, annonces et historique.`
        : "Connecte-toi ou cree un compte pour suivre reservations, commandes, annonces et messages.",
      actions: [
        { label: user ? "My account" : "Login", href: user ? "/my-account.html" : "/login.html" },
        { label: "Register", href: "/register.html" },
      ],
    };
  }

  if (
    text.includes("contact") ||
    text.includes("message") ||
    text.includes("help") ||
    text.includes("aide") ||
    text.includes("support")
  ) {
    return {
      text: "Tu peux contacter Bisklet depuis la messagerie produit ou par email. Pour une question produit, ouvre la messagerie.",
      actions: [
        { label: "Messagerie", href: "/messagerie.html" },
        { label: "Email", href: "mailto:contact@bisklet.com" },
      ],
    };
  }

  if (text.includes("exchange") || text.includes("echange")) {
    return {
      text: "Pour proposer un echange, decris ce que tu offres, ce que tu veux, puis envoie la demande.",
      actions: [{ label: "Echange", href: "/echange.html" }],
    };
  }

  return {
    text: "Je peux t'aider a trouver une location, choisir un produit, vendre un velo, ouvrir ton compte, contacter Bisklet ou aller au dashboard admin.",
    actions: [
      { label: "Location", href: "/location.html" },
      { label: "Boutique", href: "/boutique.html" },
      { label: "Contact", href: "/messagerie.html" },
    ],
  };
}

function SiteChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(loadMessages);
  const [draft, setDraft] = useState("");
  const user = useMemo(() => getStoredUser(), []);
  const endRef = useRef(null);
  const idCounter = useRef(0);

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-20)));
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isOpen]);

  const sendMessage = (value) => {
    const messageText = value.trim();

    if (!messageText) {
      return;
    }

    const userMessage = {
      id: `chat-${(idCounter.current += 1)}-user`,
      author: "user",
      text: messageText,
    };
    const botMessage = {
      id: `chat-${(idCounter.current += 1)}-bot`,
      author: "bot",
      ...buildReply(messageText, user),
    };

    setMessages((current) => [...current, userMessage, botMessage]);
    setDraft("");
    setIsOpen(true);
  };

  const submitMessage = (event) => {
    event.preventDefault();
    sendMessage(draft);
  };

  return (
    <aside className={`site-chatbot ${isOpen ? "open" : ""}`} aria-label="Assistant Bisklet">
      {isOpen && (
        <section className="chatbot-panel">
          <header className="chatbot-head">
            <div className="chatbot-brand-mark" aria-hidden="true">
              B
            </div>
            <div className="chatbot-head-copy">
              <span>Assistant intelligent</span>
              <strong>Bisklet Concierge</strong>
              <small>En ligne maintenant</small>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Fermer le chat">
              x
            </button>
          </header>

          <div className="chatbot-intro">
            <strong>Besoin d'aide rapide ?</strong>
            <span>Location, achat, vente, compte ou support en quelques clics.</span>
          </div>

          <div className="chatbot-messages" aria-live="polite">
            {messages.map((message) => (
              <article className={`chatbot-message-row ${message.author}`} key={message.id}>
                <span className="chatbot-avatar" aria-hidden="true">
                  {message.author === "bot" ? "B" : "You"}
                </span>
                <div className={`chatbot-message ${message.author}`}>
                  {message.text.split("\n").map((line, index) => (
                    <p key={`${message.id}-${index}`}>{line}</p>
                  ))}
                  {message.actions?.length > 0 && (
                    <div className="chatbot-actions">
                      {message.actions.map((action) => (
                        <a href={action.href} key={`${message.id}-${action.label}`}>
                          {action.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
            <div ref={endRef} />
          </div>

          <div className="chatbot-prompt-zone">
            <span>Suggestions</span>
            <div className="chatbot-prompts">
              {quickPrompts.map((prompt) => (
                <button type="button" key={prompt} onClick={() => sendMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <form className="chatbot-form" onSubmit={submitMessage}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ecris ta question..."
              aria-label="Message chatbot"
            />
            <button type="submit">Envoyer</button>
          </form>
        </section>
      )}

      <button
        className="chatbot-toggle"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Fermer l'assistant Bisklet" : "Ouvrir l'assistant Bisklet"}
        title="Assistant Bisklet"
      >
        <span className="chatbot-toggle-icon">
          <ChatbotIcon />
        </span>
      </button>
    </aside>
  );
}

export default SiteChatbot;
