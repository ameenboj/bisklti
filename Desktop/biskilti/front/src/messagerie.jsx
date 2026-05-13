import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./App.css";

import { getStoredUser } from "./authClient.js";
import { boutiqueProducts } from "./boutiqueData.js";
import { AdminNavLink } from "./SessionNav.jsx";
import SiteChatbot from "./SiteChatbot.jsx";

const STORAGE_PREFIX = "bisklet_messages_";

function getPendingProduct() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("product");
  const productFromData = boutiqueProducts.find((product) => product.id === productId);

  if (productFromData) {
    return productFromData;
  }

  try {
    return JSON.parse(localStorage.getItem("bisklet_pending_message_product"));
  } catch {
    return null;
  }
}

function getConversationKey(product) {
  return `${STORAGE_PREFIX}${product?.id || "general"}`;
}

function getOwnerProfile(product) {
  if (product?.category === "Pieces & entretien") {
    return {
      name: "Atelier Bisklet",
      role: "Proprietaire atelier",
      phone: "+216 99 11 00 12",
      response: "Repond souvent en 10 min",
    };
  }

  return {
    name: "Boutique Bisklet",
    role: "Proprietaire du produit",
    phone: "+216 99 11 00 12",
    response: "Disponible aujourd'hui",
  };
}

function buildInitialMessages(product, user) {
  return [
    {
      id: "welcome-owner",
      author: "owner",
      text: `Bonjour ${user?.name || "cher client"}, je peux vous aider pour ${product.title}.`,
      time: "Maintenant",
    },
    {
      id: "request-buyer",
      author: "buyer",
      text: `Bonjour, je veux acheter ce produit. Est-ce que ${product.title} est disponible ?`,
      time: "Maintenant",
    },
  ];
}

function loadMessages(product, user) {
  const key = getConversationKey(product);
  const stored = localStorage.getItem(key);

  if (!stored) {
    const initialMessages = buildInitialMessages(product, user);
    localStorage.setItem(key, JSON.stringify(initialMessages));
    return initialMessages;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return buildInitialMessages(product, user);
  }
}

export default function MessagePage() {
  const user = getStoredUser();
  const product = useMemo(() => getPendingProduct() || boutiqueProducts[0], []);
  const owner = useMemo(() => getOwnerProfile(product), [product]);
  const storageKey = useMemo(() => getConversationKey(product), [product]);
  const [messages, setMessages] = useState(() => loadMessages(product, user));
  const [draft, setDraft] = useState("");
  const [sender, setSender] = useState("buyer");
  const [dealStatus, setDealStatus] = useState(product.stock || "Disponible");
  const threadRef = useRef(null);
  const threadEndRef = useRef(null);

  const buyerName = user?.name || "Acheteur invite";
  const buyerEmail = user?.email || "guest@bisklet.local";
  const lastMessage = messages[messages.length - 1];

  useEffect(() => {
    window.requestAnimationFrame(() => {
      threadEndRef.current?.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });

      if (threadRef.current) {
        threadRef.current.scrollTop = threadRef.current.scrollHeight;
      }
    });
  }, [messages]);

  const saveMessages = (nextMessages) => {
    setMessages(nextMessages);
    localStorage.setItem(storageKey, JSON.stringify(nextMessages));
  };

  const sendMessage = (event) => {
    event.preventDefault();
    const text = draft.trim();

    if (!text) {
      return;
    }

    saveMessages([
      ...messages,
      {
        id: `${Date.now()}-${sender}`,
        author: sender,
        text,
        time: new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setDraft("");
  };

  const sendQuickReply = (text, nextStatus = dealStatus) => {
    setDealStatus(nextStatus);
    saveMessages([
      ...messages,
      {
        id: `${Date.now()}-owner`,
        author: "owner",
        text,
        time: new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  return (
    <main className="site-shell message-shell">
      <header className="detail-topbar">
        <a className="brand" href="/">
          <span className="brand-logo">B</span>
          <span className="brand-name">Bisklet</span>
        </a>
        <nav className="topnav" aria-label="Navigation messagerie">
          <a href="/boutique-produits.html">PRODUITS</a>
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
        </div>
      </header>

      <section className="message-layout" aria-label="Messagerie produit">
        <aside className="message-product-panel">
          <div className="message-product-image">
            <img src={product.image} alt={product.title} />
            <span>{product.badge || "Produit"}</span>
          </div>
          <div className="message-product-info">
            <span className="section-kicker">{product.category}</span>
            <h1>{product.title}</h1>
            <strong>{product.price}</strong>
            <p>{product.text}</p>
          </div>
          <div className="message-status-card">
            <span>Statut</span>
            <strong>{dealStatus}</strong>
          </div>
          <div className="message-contact-card">
            <h2>Participants</h2>
            <div className="message-person-row">
              <span className="message-avatar buyer-avatar">A</span>
              <p>
                <strong>{buyerName}</strong>
                <span>{buyerEmail}</span>
              </p>
            </div>
            <div className="message-person-row">
              <span className="message-avatar owner-avatar">P</span>
              <p>
                <strong>{owner.name}</strong>
                <span>{owner.role}</span>
              </p>
            </div>
          </div>
        </aside>

        <section className="message-chat-panel">
          <div className="message-chat-head">
            <div className="message-head-profile">
              <span className="message-avatar owner-avatar">P</span>
              <div>
                <span className="section-kicker">Conversation</span>
                <h2>{owner.name}</h2>
                <p>{owner.response} - {owner.phone}</p>
              </div>
            </div>
            <div className="message-mode-toggle" aria-label="Choisir expediteur">
              <button
                className={sender === "buyer" ? "active" : ""}
                type="button"
                onClick={() => setSender("buyer")}
              >
                Acheteur
              </button>
              <button
                className={sender === "owner" ? "active" : ""}
                type="button"
                onClick={() => setSender("owner")}
              >
                Proprietaire
              </button>
            </div>
          </div>

          {lastMessage && (
            <div className="message-last-preview">
              <span>Dernier message</span>
              <p>
                <strong>
                  {lastMessage.author === "buyer" ? buyerName : owner.name}
                </strong>
                {lastMessage.text}
              </p>
            </div>
          )}

          <div className="message-quick-actions" aria-label="Reponses rapides">
            <button
              type="button"
              onClick={() =>
                sendQuickReply(
                  "Oui, le produit est disponible. Vous pouvez passer aujourd'hui ou reserver un creneau.",
                  "Disponible",
                )
              }
            >
              Disponible
            </button>
            <button
              type="button"
              onClick={() =>
                sendQuickReply(
                  "Je peux vous le reserver. Donnez-moi votre horaire de passage.",
                  "Reservation possible",
                )
              }
            >
              Reserver
            </button>
            <button
              type="button"
              onClick={() =>
                sendQuickReply(
                  "Le stock est limite. Je vous confirme la disponibilite exacte avant votre deplacement.",
                  "Stock a confirmer",
                )
              }
            >
              Confirmer stock
            </button>
          </div>

          <div className="message-thread" ref={threadRef} aria-live="polite">
            {messages.map((message, index) => (
              <article
                className={`message-bubble ${message.author === "buyer" ? "buyer" : "owner"} ${
                  index === messages.length - 1 ? "latest" : ""
                }`}
                key={message.id}
              >
                <span>{message.author === "buyer" ? buyerName : owner.name}</span>
                <p>{message.text}</p>
                <small>{message.time}</small>
              </article>
            ))}
            <div ref={threadEndRef} aria-hidden="true" />
          </div>

          <form className="message-composer" onSubmit={sendMessage}>
            <label>
              <span>Message</span>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage(event);
                  }
                }}
                placeholder={
                  sender === "buyer"
                    ? "Ecrire au proprietaire..."
                    : "Repondre a l'acheteur..."
                }
                rows="3"
              />
            </label>
            <button className="product-buy-button" type="submit">
              Envoyer message
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MessagePage />
    <SiteChatbot />
  </StrictMode>,
);
