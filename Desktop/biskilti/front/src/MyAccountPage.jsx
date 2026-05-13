import "./App.css";

import { useEffect, useMemo, useState } from "react";
import {
  apiRequest,
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  storeAuthSession,
} from "./authClient.js";

const emptyAccount = {
  stats: {
    bookings: 0,
    orders: 0,
    listings: 0,
    exchanges: 0,
    contacts: 0,
  },
  activity: {
    bookings: [],
    orders: [],
    listings: [],
    exchanges: [],
    contacts: [],
  },
};

const emptyQuickForm = {
  rental_title: "Location velo urbain",
  booking_date: "",
  product_title: "City E-Bike Sunset",
  listing_title: "",
  listing_category: "Velo urbain",
  listing_brand: "",
  listing_model: "",
  listing_year: "",
  listing_size: "",
  listing_color: "",
  listing_frame_material: "",
  listing_transmission: "",
  listing_brakes: "",
  listing_wheel_size: "",
  listing_price: "",
  listing_discount_percent: "",
  listing_condition: "Tres bon etat",
  listing_location: "Tunis",
  listing_image_url: "",
  listing_contact_preference: "phone",
  listing_description: "",
  exchange_offered: "",
  exchange_wanted: "",
};

const tabs = [
  { id: "overview", label: "Apercu", description: "Tableau de bord" },
  { id: "profile", label: "Profil", description: "Coordonnees" },
  { id: "activity", label: "Activite", description: "Historique" },
  { id: "actions", label: "Actions", description: "Demandes rapides" },
];

function formatDate(value) {
  if (!value) {
    return "Aujourd'hui";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusLabel(status) {
  const labels = {
    pending: "En attente",
    new: "Nouveau",
    accepted: "Accepte",
    completed: "Termine",
    cancelled: "Annule",
  };

  return labels[status] || status || "En attente";
}

function getInitialProfile(user) {
  return {
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "Tunis",
    preferredContact: user?.preferredContact || "phone",
  };
}

function boutiqueListingUrl(listing) {
  const listingId = listing?.id ? `listing-${listing.id}` : "";

  return listingId
    ? `/boutique.html?annonce=${encodeURIComponent(listingId)}`
    : "/boutique.html";
}

function listingToQuickForm(listing) {
  return {
    listing_title: listing?.title || "",
    listing_category: listing?.category || "Velo urbain",
    listing_brand: listing?.brand || "",
    listing_model: listing?.model || "",
    listing_year: listing?.year ? String(listing.year) : "",
    listing_size: listing?.size || "",
    listing_color: listing?.color || "",
    listing_frame_material: listing?.frame_material || "",
    listing_transmission: listing?.transmission || "",
    listing_brakes: listing?.brakes || "",
    listing_wheel_size: listing?.wheel_size || "",
    listing_price: listing?.price ? String(listing.price) : "",
    listing_discount_percent: listing?.discount_percent
      ? String(listing.discount_percent)
      : "",
    listing_condition: listing?.condition || "Tres bon etat",
    listing_location: listing?.location || "Tunis",
    listing_image_url: listing?.image_url || "",
    listing_contact_preference: listing?.contact_preference || "phone",
    listing_description: listing?.description || "",
  };
}

function optionalNumber(value) {
  return value === "" || value === null || value === undefined ? null : Number(value);
}

function parsePercent(value) {
  const cleanedValue = String(value ?? "")
    .replace("%", "")
    .replace("-", "")
    .trim();

  return cleanedValue === "" ? 0 : Number(cleanedValue);
}

function discountNumber(value) {
  const discount = parsePercent(value);

  return Number.isInteger(discount) && discount >= 0 && discount <= 100
    ? discount
    : 0;
}

function MyAccountPage() {
  const [user, setUser] = useState(getStoredUser());
  const [account, setAccount] = useState(emptyAccount);
  const [activeTab, setActiveTab] = useState("overview");
  const [profileForm, setProfileForm] = useState(() => getInitialProfile(user));
  const [quickForm, setQuickForm] = useState(emptyQuickForm);
  const [editingListingId, setEditingListingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [listingImagePreview, setListingImagePreview] = useState("");
  const [listingImageName, setListingImageName] = useState("");
  const [message, setMessage] = useState("");

  const token = getStoredToken();
  const isLoggedIn = Boolean(user && token);
  const stats = account.stats || emptyAccount.stats;
  const activity = account.activity || emptyAccount.activity;
  const totalActivity = Object.values(stats).reduce(
    (total, value) => total + Number(value || 0),
    0,
  );

  const profileFields = useMemo(
    () => [
      { label: "Nom", value: user?.name || "Invite" },
      { label: "Email", value: user?.email || "-" },
      { label: "Telephone", value: user?.phone || "Non renseigne" },
      { label: "Adresse", value: user?.address || "Non renseignee" },
      { label: "Ville", value: user?.city || "Tunis" },
    ],
    [user],
  );
  const statCards = useMemo(
    () => [
      { key: "bookings", label: "Reservations", value: stats.bookings },
      { key: "orders", label: "Commandes", value: stats.orders },
      { key: "listings", label: "Annonces", value: stats.listings },
      { key: "exchanges", label: "Echanges", value: stats.exchanges },
      { key: "contacts", label: "Contacts", value: stats.contacts },
    ],
    [stats],
  );

  const loadAccount = async () => {
    if (!getStoredToken()) {
      setAccount(emptyAccount);
      setUser(null);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await apiRequest("/api/account");
      storeAuthSession({ token: getStoredToken(), user: data.user });
      setUser(data.user);
      setProfileForm(getInitialProfile(data.user));
      setAccount({ stats: data.stats, activity: data.activity });
    } catch (error) {
      setMessage(error.message);
      if (error.message === "Non connecte.") {
        clearAuthSession();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const task = window.setTimeout(() => {
      loadAccount();
    }, 0);

    return () => window.clearTimeout(task);
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest("/api/logout", { method: "POST" });
    } catch {
      // The local session is still cleared if the API is unavailable.
    }

    clearAuthSession();
    setUser(null);
    setAccount(emptyAccount);
    window.location.href = "/login.html";
  };

  const updateProfileField = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const updateQuickField = (field, value) => {
    setQuickForm((current) => ({ ...current, [field]: value }));
  };

  const uploadListingImage = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Choisissez une image valide.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image trop grande. Maximum 5 MB.");
      return;
    }

    setImageUploading(true);
    setMessage("");
    setListingImageName(file.name);

    const reader = new FileReader();

    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      setListingImagePreview(dataUrl);

      try {
        const data = await apiRequest("/api/listing-images", {
          method: "POST",
          body: JSON.stringify({
            data_url: dataUrl,
            file_name: file.name,
          }),
        });
        updateQuickField("listing_image_url", data.image_url || "");
        setListingImagePreview(data.image_url || dataUrl);
        setMessage("Image ajoutee a l'annonce.");
      } catch (error) {
        setMessage(error.message || "Upload image impossible.");
      } finally {
        setImageUploading(false);
      }
    };

    reader.onerror = () => {
      setImageUploading(false);
      setMessage("Lecture de l'image impossible.");
    };

    reader.readAsDataURL(file);
  };

  const clearListingImage = () => {
    setListingImagePreview("");
    setListingImageName("");
    updateQuickField("listing_image_url", "");
  };

  const startListingEdit = (listing) => {
    if (!listing?.id) {
      return;
    }

    setEditingListingId(listing.id);
    setQuickForm((current) => ({ ...current, ...listingToQuickForm(listing) }));
    setListingImagePreview(listing.image_url || "");
    setListingImageName(listing.image_url ? "Image actuelle" : "");
    setMessage(`Modification de l'annonce "${listing.title || "Annonce"}".`);
    setActiveTab("actions");
  };

  const cancelListingEdit = () => {
    setEditingListingId(null);
    setQuickForm(emptyQuickForm);
    setListingImagePreview("");
    setListingImageName("");
    setMessage("");
  };

  const listingToApiBody = (source) => ({
    title: source.listing_title || source.title || "Velo a vendre",
    category: source.listing_category || source.category || "Velo urbain",
    brand: source.listing_brand ?? source.brand ?? "",
    model: source.listing_model ?? source.model ?? "",
    year: optionalNumber(source.listing_year ?? source.year),
    size: source.listing_size ?? source.size ?? "",
    color: source.listing_color ?? source.color ?? "",
    frame_material: source.listing_frame_material ?? source.frame_material ?? "",
    transmission: source.listing_transmission ?? source.transmission ?? "",
    brakes: source.listing_brakes ?? source.brakes ?? "",
    wheel_size: source.listing_wheel_size ?? source.wheel_size ?? "",
    price: optionalNumber(source.listing_price ?? source.price),
    discount_percent: discountNumber(
      source.listing_discount_percent ?? source.discount_percent,
    ),
    condition: source.listing_condition ?? source.condition ?? "",
    location:
      source.listing_location ?? source.location ?? profileForm.city ?? "Tunis",
    description: source.listing_description ?? source.description ?? "",
    image_url: source.listing_image_url ?? source.image_url ?? "",
    contact_preference:
      source.listing_contact_preference ?? source.contact_preference ?? "phone",
  });

  const updateListingPercent = async (listing) => {
    if (!listing?.id) {
      return;
    }

    const currentPercent = Number(listing.discount_percent || 0);
    const answer = window.prompt(
      "Pourcentage de remise pour cette annonce (0 a 100)",
      currentPercent ? String(currentPercent) : "",
    );

    if (answer === null) {
      return;
    }

    const discountPercent = parsePercent(answer);

    if (
      !Number.isInteger(discountPercent) ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      setMessage("Entrez un pourcentage entier entre 0 et 100.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const data = await apiRequest(`/api/listings/${listing.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...listingToApiBody(listing),
          discount_percent: discountPercent,
        }),
      });

      setMessage(data.message || "Pourcentage mis a jour.");
      await loadAccount();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const data = await apiRequest("/api/account/profile", {
        method: "PATCH",
        body: JSON.stringify(profileForm),
      });
      const nextUser = data.user || data.account?.user;
      storeAuthSession({ token: getStoredToken(), user: nextUser });
      setUser(nextUser);
      setAccount(data.account || account);
      setMessage(data.message || "Profil mis a jour.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const createQuickItem = async (type) => {
    if (!isLoggedIn) {
      window.location.href = "/login.html";
      return;
    }

    const listingBody = listingToApiBody(quickForm);
    const endpoints = {
      booking: {
        path: "/api/bookings",
        body: {
          rental_title: quickForm.rental_title,
          booking_date: quickForm.booking_date || null,
          notes: "Cree depuis My Account",
        },
      },
      order: {
        path: "/api/orders",
        body: {
          product_title: quickForm.product_title,
          notes: "Demande rapide depuis My Account",
        },
      },
      listing: {
        path: editingListingId ? `/api/listings/${editingListingId}` : "/api/listings",
        method: editingListingId ? "PATCH" : "POST",
        body: listingBody,
      },
      exchange: {
        path: "/api/exchanges",
        body: {
          offered_item: quickForm.exchange_offered || "Velo a echanger",
          wanted_item: quickForm.exchange_wanted || "Accessoire velo",
          description: "Demande creee depuis My Account.",
        },
      },
    };

    setSaving(true);
    setMessage("");

    try {
      const action = endpoints[type];
      const data = await apiRequest(action.path, {
        method: action.method || "POST",
        body: JSON.stringify(action.body),
      });

      if (type === "listing") {
        if (editingListingId) {
          setEditingListingId(null);
          setQuickForm(emptyQuickForm);
          setListingImagePreview("");
          setListingImageName("");
          setMessage(data.message || "Annonce mise a jour.");
          await loadAccount();
          setActiveTab("activity");
          return;
        }

        setMessage(`${data.message || "Annonce creee."} Ouverture de la boutique...`);
        window.setTimeout(() => {
          window.location.assign(boutiqueListingUrl(data.listing));
        }, 700);
        return;
      }

      setMessage(data.message || "Action creee.");
      await loadAccount();
      setActiveTab("activity");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderActivityList = (items, emptyText, getTitle, renderActions) => (
    <div className="account-activity-list">
      {items.length === 0 ? (
        <div className="account-empty-state">{emptyText}</div>
      ) : (
        items.map((item) => (
          <article className="account-activity-item" key={`${getTitle(item)}-${item.id}`}>
            <div>
              <h4>{getTitle(item)}</h4>
              <p>{item.notes || item.description || item.location || "Suivi Bisklet"}</p>
            </div>
            <div>
              <span className="account-status">{statusLabel(item.status)}</span>
              <small>{formatDate(item.created_at)}</small>
              {renderActions?.(item)}
            </div>
          </article>
        ))
      )}
    </div>
  );

  return (
    <main className="site-shell account-shell account-premium-shell">
      <div className="contact-bar">
        <div className="contact-content">
          <span className="contact-item">Tel: +216 99 11 00 12</span>
          <span className="contact-item">Adresse: Ennasr 2</span>
        </div>
        <div className="social-icons">
          <a href="https://bisklet.com/" aria-label="Facebook">
            f
          </a>
          <a href="https://bisklet.com/" aria-label="Instagram">
            in
          </a>
          <a href="mailto:contact@bisklet.com" aria-label="Email">
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
          {user?.role === "admin" && <a href="/admin-dashboard.html">ADMIN</a>}
        </nav>

        <div className="top-actions">
          {isLoggedIn ? (
            <button className="account-top-button" type="button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <a className="login-link" href="/login.html">
                Login
              </a>
              <a className="register-link" href="/register.html">
                Register
              </a>
            </>
          )}
        </div>
      </header>

      <section className="account-hero">
        <div className="account-hero-copy">
          <span className="section-kicker">My account</span>
          <h1>{isLoggedIn ? `Espace premium de ${user.name}` : "Votre espace premium"}</h1>
          <p>
            {isLoggedIn
              ? "Pilotez votre profil, publiez un velo complet, suivez vos demandes et gardez toutes vos actions Bisklet au meme endroit."
              : "Connectez-vous pour publier un velo, suivre vos demandes et gerer votre compte avec un tableau de bord dynamique."}
          </p>
          <div className="account-hero-pills" aria-label="Avantages du compte">
            <span>Profil clair</span>
            <span>Suivi en temps reel</span>
            <span>Actions rapides</span>
          </div>
        </div>
        <div className="account-hero-card">
          <span>Activite totale</span>
          <strong>{totalActivity}</strong>
          <p>{loading ? "Chargement..." : "Actions liees a votre compte"}</p>
        </div>
      </section>

      {message && <div className="account-message">{message}</div>}

      {!isLoggedIn ? (
        <section className="account-auth-panel">
          <div>
            <span className="section-kicker">Connexion requise</span>
            <h2>Connectez-vous pour voir vos donnees.</h2>
            <p>
              Le compte devient dynamique apres login: profil editable, stats,
              historique et actions rapides.
            </p>
          </div>
          <div className="account-auth-actions">
            <a className="primary-link btn-premium" href="/login.html">
              Login
            </a>
            <a className="secondary-link btn-premium" href="/register.html">
              Creer un compte
            </a>
          </div>
        </section>
      ) : (
        <section className="account-dashboard">
          <aside className="account-sidebar">
            <div className="account-sidebar-head">
              <div className="account-avatar">{user.name?.slice(0, 1).toUpperCase()}</div>
              <span className="account-member-badge">Membre Bisklet</span>
            </div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <div className="account-mini-list">
              <span>{user.city || "Tunis"}</span>
              <span>{user.phone || "Telephone non ajoute"}</span>
            </div>
            <button type="button" onClick={loadAccount}>
              Actualiser
            </button>
            <nav aria-label="Sections du compte">
              {tabs.map((tab) => (
                <button
                  className={activeTab === tab.id ? "active" : ""}
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.label}</span>
                  <small>{tab.description}</small>
                </button>
              ))}
            </nav>
          </aside>

          <div className="account-main-panel">
            {activeTab === "overview" && (
              <div className="account-panel-section">
                <div className="account-section-head">
                  <div>
                    <span className="section-kicker">Dashboard</span>
                    <h2>Apercu du compte</h2>
                  </div>
                  <button type="button" onClick={() => setActiveTab("actions")}>
                    Nouvelle action
                  </button>
                </div>

                <div className="account-stat-grid">
                  {statCards.map((stat) => (
                    <div className={`account-stat-card stat-${stat.key}`} key={stat.key}>
                      <span>{stat.label}</span>
                      <strong>{stat.value || 0}</strong>
                      <small>Mis a jour</small>
                    </div>
                  ))}
                </div>

                <div className="account-profile-summary">
                  {profileFields.map((field) => (
                    <div key={field.label}>
                      <span>{field.label}</span>
                      <strong>{field.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <form className="account-panel-section" onSubmit={saveProfile}>
                <div className="account-section-head">
                  <div>
                    <span className="section-kicker">Profil</span>
                    <h2>Informations personnelles</h2>
                  </div>
                  <button type="submit" disabled={saving}>
                    {saving ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </div>

                <div className="account-form-grid">
                  <label>
                    <span>Nom complet</span>
                    <input
                      value={profileForm.name}
                      onChange={(event) => updateProfileField("name", event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Email</span>
                    <input value={user.email} disabled />
                  </label>
                  <label>
                    <span>Telephone</span>
                    <input
                      value={profileForm.phone}
                      onChange={(event) => updateProfileField("phone", event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Ville</span>
                    <input
                      value={profileForm.city}
                      onChange={(event) => updateProfileField("city", event.target.value)}
                    />
                  </label>
                  <label className="wide">
                    <span>Adresse</span>
                    <input
                      value={profileForm.address}
                      onChange={(event) => updateProfileField("address", event.target.value)}
                    />
                  </label>
                  <label className="wide">
                    <span>Contact prefere</span>
                    <select
                      value={profileForm.preferredContact}
                      onChange={(event) =>
                        updateProfileField("preferredContact", event.target.value)
                      }
                    >
                      <option value="phone">Telephone</option>
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </label>
                </div>
              </form>
            )}

            {activeTab === "activity" && (
              <div className="account-panel-section">
                <div className="account-section-head">
                  <div>
                    <span className="section-kicker">Historique</span>
                    <h2>Activite recente</h2>
                  </div>
                  <button type="button" onClick={loadAccount}>
                    Actualiser
                  </button>
                </div>

                <div className="account-history-grid">
                  <section>
                    <h3>Reservations</h3>
                    {renderActivityList(
                      activity.bookings || [],
                      "Aucune reservation pour le moment.",
                      (item) => item.title || item.rental_title || "Reservation",
                    )}
                  </section>
                  <section>
                    <h3>Commandes</h3>
                    {renderActivityList(
                      activity.orders || [],
                      "Aucune commande pour le moment.",
                      (item) => item.title || item.product_title || "Commande",
                    )}
                  </section>
                  <section>
                    <h3>Annonces</h3>
                    {renderActivityList(
                      activity.listings || [],
                      "Aucune annonce publiee.",
                      (item) => item.title || "Annonce",
                      (item) => (
                        <>
                          <button
                            className="account-activity-action"
                            type="button"
                            onClick={() => startListingEdit(item)}
                          >
                            Modifier
                          </button>
                          <button
                            className="account-activity-action"
                            type="button"
                            disabled={saving}
                            onClick={() => updateListingPercent(item)}
                          >
                            Pourcentage
                          </button>
                        </>
                      ),
                    )}
                  </section>
                  <section>
                    <h3>Echanges</h3>
                    {renderActivityList(
                      activity.exchanges || [],
                      "Aucune demande d'echange.",
                      (item) => item.offered_item || "Echange",
                    )}
                  </section>
                </div>
              </div>
            )}

            {activeTab === "actions" && (
              <div className="account-panel-section">
                <div className="account-section-head">
                  <div>
                    <span className="section-kicker">Actions rapides</span>
                    <h2>Creer depuis le compte</h2>
                  </div>
                  <button type="button" onClick={() => setActiveTab("activity")}>
                    {editingListingId ? "Retour historique" : "Voir historique"}
                  </button>
                </div>

                <div className="account-action-grid">
                  <article className="bike-post-card">
                    <div className="bike-post-head">
                      <div>
                        <span className="section-kicker">Vendre un velo</span>
                        <h3>
                          {editingListingId
                            ? "Modifier votre annonce velo"
                            : "Publier une annonce velo complete"}
                        </h3>
                        <p>
                          {editingListingId
                            ? "Ajustez les details de l'annonce selectionnee. Elle reste liee a votre compte."
                            : "Remplissez les details importants pour aider l'acheteur a comprendre l'etat, la taille, les composants et le prix."}
                        </p>
                      </div>
                      <div
                        className="bike-preview-card"
                        style={
                          listingImagePreview || quickForm.listing_image_url
                            ? {
                                backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.04), rgba(15, 23, 42, 0.78)), url("${listingImagePreview || quickForm.listing_image_url}")`,
                              }
                            : undefined
                        }
                      >
                        <span>{quickForm.listing_category}</span>
                        <strong>{quickForm.listing_price || "0"} DT</strong>
                        <p>
                          {quickForm.listing_brand || "Marque"}{" "}
                          {quickForm.listing_model || "Modele"}
                        </p>
                      </div>
                    </div>

                    <div className="bike-form-grid">
                      <label>
                        <span>Titre annonce</span>
                        <input
                          value={quickForm.listing_title}
                          onChange={(event) =>
                            updateQuickField("listing_title", event.target.value)
                          }
                          placeholder="Ex: VTT Trek Marlin 7"
                        />
                      </label>
                      <label>
                        <span>Categorie</span>
                        <select
                          value={quickForm.listing_category}
                          onChange={(event) =>
                            updateQuickField("listing_category", event.target.value)
                          }
                        >
                          <option>Velo urbain</option>
                          <option>VTT</option>
                          <option>Velo route</option>
                          <option>Velo electrique</option>
                          <option>BMX</option>
                          <option>Gravel</option>
                        </select>
                      </label>
                      <label>
                        <span>Marque</span>
                        <input
                          value={quickForm.listing_brand}
                          onChange={(event) =>
                            updateQuickField("listing_brand", event.target.value)
                          }
                          placeholder="Trek, Giant, Btwin..."
                        />
                      </label>
                      <label>
                        <span>Modele</span>
                        <input
                          value={quickForm.listing_model}
                          onChange={(event) =>
                            updateQuickField("listing_model", event.target.value)
                          }
                          placeholder="Marlin 7, Riverside..."
                        />
                      </label>
                      <label>
                        <span>Annee</span>
                        <input
                          type="number"
                          min="1970"
                          max="2035"
                          value={quickForm.listing_year}
                          onChange={(event) =>
                            updateQuickField("listing_year", event.target.value)
                          }
                          placeholder="2023"
                        />
                      </label>
                      <label>
                        <span>Taille</span>
                        <select
                          value={quickForm.listing_size}
                          onChange={(event) =>
                            updateQuickField("listing_size", event.target.value)
                          }
                        >
                          <option value="">Choisir taille</option>
                          <option>XS</option>
                          <option>S</option>
                          <option>M</option>
                          <option>L</option>
                          <option>XL</option>
                          <option>26 pouces</option>
                          <option>27.5 pouces</option>
                          <option>29 pouces</option>
                        </select>
                      </label>
                      <label>
                        <span>Couleur</span>
                        <input
                          value={quickForm.listing_color}
                          onChange={(event) =>
                            updateQuickField("listing_color", event.target.value)
                          }
                          placeholder="Noir, bleu..."
                        />
                      </label>
                      <label>
                        <span>Matiere cadre</span>
                        <select
                          value={quickForm.listing_frame_material}
                          onChange={(event) =>
                            updateQuickField("listing_frame_material", event.target.value)
                          }
                        >
                          <option value="">Choisir matiere</option>
                          <option>Aluminium</option>
                          <option>Carbone</option>
                          <option>Acier</option>
                          <option>Titane</option>
                        </select>
                      </label>
                      <label>
                        <span>Transmission</span>
                        <input
                          value={quickForm.listing_transmission}
                          onChange={(event) =>
                            updateQuickField("listing_transmission", event.target.value)
                          }
                          placeholder="Shimano Deore, 1x12..."
                        />
                      </label>
                      <label>
                        <span>Freins</span>
                        <select
                          value={quickForm.listing_brakes}
                          onChange={(event) =>
                            updateQuickField("listing_brakes", event.target.value)
                          }
                        >
                          <option value="">Choisir freins</option>
                          <option>Disque hydraulique</option>
                          <option>Disque mecanique</option>
                          <option>V-Brake</option>
                          <option>Patins route</option>
                        </select>
                      </label>
                      <label>
                        <span>Taille roues</span>
                        <select
                          value={quickForm.listing_wheel_size}
                          onChange={(event) =>
                            updateQuickField("listing_wheel_size", event.target.value)
                          }
                        >
                          <option value="">Choisir roues</option>
                          <option>20 pouces</option>
                          <option>24 pouces</option>
                          <option>26 pouces</option>
                          <option>27.5 pouces</option>
                          <option>29 pouces</option>
                          <option>700c</option>
                        </select>
                      </label>
                      <label>
                        <span>Etat</span>
                        <select
                          value={quickForm.listing_condition}
                          onChange={(event) =>
                            updateQuickField("listing_condition", event.target.value)
                          }
                        >
                          <option>Neuf</option>
                          <option>Tres bon etat</option>
                          <option>Bon etat</option>
                          <option>Etat moyen</option>
                          <option>A reparer</option>
                        </select>
                      </label>
                      <label>
                        <span>Prix DT</span>
                        <input
                          type="number"
                          min="0"
                          value={quickForm.listing_price}
                          onChange={(event) =>
                            updateQuickField("listing_price", event.target.value)
                          }
                          placeholder="Ex: 1450"
                        />
                      </label>
                      <label>
                        <span>Remise %</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={quickForm.listing_discount_percent}
                          onChange={(event) =>
                            updateQuickField(
                              "listing_discount_percent",
                              event.target.value,
                            )
                          }
                          placeholder="Ex: 15"
                        />
                      </label>
                      <label>
                        <span>Localisation</span>
                        <input
                          value={quickForm.listing_location}
                          onChange={(event) =>
                            updateQuickField("listing_location", event.target.value)
                          }
                          placeholder="Tunis, Ariana..."
                        />
                      </label>
                      <label>
                        <span>Contact prefere</span>
                        <select
                          value={quickForm.listing_contact_preference}
                          onChange={(event) =>
                            updateQuickField(
                              "listing_contact_preference",
                              event.target.value,
                            )
                          }
                        >
                          <option value="phone">Telephone</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="email">Email</option>
                        </select>
                      </label>
                      <div className="wide bike-upload-group">
                        <span>Photo principale</span>
                        <div className="bike-upload-field">
                          <input
                            id="listing-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={uploadListingImage}
                          />
                          <label htmlFor="listing-image-upload">
                            {imageUploading ? "Upload en cours..." : "Choisir une image"}
                          </label>
                          <strong>{listingImageName || "Aucune image choisie"}</strong>
                          {(listingImagePreview || quickForm.listing_image_url) && (
                            <button type="button" onClick={clearListingImage}>
                              Supprimer
                            </button>
                          )}
                        </div>
                      </div>
                      <label className="wide">
                        <span>Photo principale URL</span>
                        <input
                          value={quickForm.listing_image_url}
                          onChange={(event) =>
                            updateQuickField("listing_image_url", event.target.value)
                          }
                          placeholder="https://..."
                        />
                      </label>
                      <label className="wide">
                        <span>Description complete</span>
                        <textarea
                          value={quickForm.listing_description}
                          onChange={(event) =>
                            updateQuickField("listing_description", event.target.value)
                          }
                          placeholder="Etat reel, reparations recentes, accessoires inclus, raison de vente..."
                          rows="4"
                        />
                      </label>
                    </div>

                    <button
                      className="bike-submit-button"
                      type="button"
                      disabled={saving}
                      onClick={() => createQuickItem("listing")}
                    >
                      {saving
                        ? "Enregistrement..."
                        : editingListingId
                          ? "Mettre a jour l'annonce"
                          : "Publier le velo"}
                    </button>
                    {editingListingId && (
                      <button
                        className="bike-cancel-button"
                        type="button"
                        disabled={saving}
                        onClick={cancelListingEdit}
                      >
                        Annuler modification
                      </button>
                    )}
                  </article>

                  <article className="quick-action-card">
                    <h3>Reservation</h3>
                    <p>Bloquez une offre de location et gardez la demande dans votre suivi.</p>
                    <input
                      value={quickForm.rental_title}
                      onChange={(event) => updateQuickField("rental_title", event.target.value)}
                      placeholder="Offre de location"
                    />
                    <input
                      type="date"
                      value={quickForm.booking_date}
                      onChange={(event) => updateQuickField("booking_date", event.target.value)}
                    />
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => createQuickItem("booking")}
                    >
                      Creer reservation
                    </button>
                  </article>

                  <article className="quick-action-card">
                    <h3>Commande boutique</h3>
                    <p>Demandez un produit et retrouvez la commande dans votre historique.</p>
                    <input
                      value={quickForm.product_title}
                      onChange={(event) => updateQuickField("product_title", event.target.value)}
                      placeholder="Nom du produit"
                    />
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => createQuickItem("order")}
                    >
                      Demander produit
                    </button>
                    <a href="/boutique-produits.html">Voir la boutique</a>
                  </article>

                  <article className="quick-action-card">
                    <h3>Echange</h3>
                    <p>Proposez un objet et indiquez ce que vous souhaitez recevoir.</p>
                    <input
                      value={quickForm.exchange_offered}
                      onChange={(event) =>
                        updateQuickField("exchange_offered", event.target.value)
                      }
                      placeholder="Objet propose"
                    />
                    <input
                      value={quickForm.exchange_wanted}
                      onChange={(event) =>
                        updateQuickField("exchange_wanted", event.target.value)
                      }
                      placeholder="Objet souhaite"
                    />
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => createQuickItem("exchange")}
                    >
                      Proposer echange
                    </button>
                  </article>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default MyAccountPage;
