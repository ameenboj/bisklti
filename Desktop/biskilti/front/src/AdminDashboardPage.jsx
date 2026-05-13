import "./App.css";

import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "react-apexcharts";
import { apiRequest, getStoredUser } from "./authClient.js";

const tabs = [
  { id: "overview", label: "Vue generale", detail: "Pilotage" },
  { id: "users", label: "Utilisateurs", detail: "Roles et acces" },
  { id: "sellers", label: "Vendeurs", detail: "Validation" },
  { id: "products", label: "Produits", detail: "Catalogue" },
  { id: "orders", label: "Commandes", detail: "Suivi" },
  { id: "analytics", label: "Analytics", detail: "Revenus" },
  { id: "notifications", label: "Alertes", detail: "Priorites" },
];

const emptyAdmin = {
  metrics: {
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalSellers: 0,
    pendingDeliveries: 0,
    refundRequests: 0,
    lowStockAlerts: 0,
    pendingApprovals: 0,
  },
  analytics: { monthlyRevenue: [], salesChannels: [] },
  notifications: [],
  users: [],
  sellers: [],
  products: [],
  orders: [],
  activities: [],
};

const roleLabels = {
  admin: "Administrateur",
  buyer: "Acheteur",
  seller: "Vendeur",
};

const statusLabels = {
  active: "Actif",
  suspended: "Suspendu",
  banned: "Banni",
  pending: "En attente",
  approved: "Approuve",
  rejected: "Rejete",
  verified: "Verifie",
  unverified: "Non verifie",
  warning: "A verifier",
  info: "Information",
};

function money(value) {
  return `${Number(value || 0).toLocaleString("fr-FR")} DT`;
}

function dateLabel(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function readableStatus(value) {
  return statusLabels[value] || roleLabels[value] || value || "En attente";
}

function statusClass(value) {
  return `admin-status ${String(value || "pending").toLowerCase()}`;
}

function downloadTextFile(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function productToForm(product) {
  return {
    id: product.id,
    title: product.title || "",
    category: product.category || "",
    brand: product.brand || "",
    model: product.model || "",
    year: product.year ? String(product.year) : "",
    size: product.size || "",
    color: product.color || "",
    frame_material: product.frame_material || "",
    transmission: product.transmission || "",
    brakes: product.brakes || "",
    wheel_size: product.wheel_size || "",
    price: product.price ? String(product.price) : "",
    discount_percent: product.discount_percent ? String(product.discount_percent) : "",
    stock_quantity:
      product.stock_quantity || product.stock_quantity === 0
        ? String(product.stock_quantity)
        : "1",
    condition: product.condition || "",
    location: product.location || "",
    description: product.description || "",
    image_url: product.image_url || "",
    contact_preference: product.contact_preference || "phone",
    status: product.status || "pending",
    is_featured: Boolean(product.is_featured),
    seller_name: product.seller_name || "",
    created_at: product.created_at || "",
  };
}

function formNumber(value) {
  return value === "" || value === null || value === undefined ? null : Number(value);
}

function AdminDashboardPage() {
  const [user, setUser] = useState(getStoredUser());
  const [data, setData] = useState(emptyAdmin);
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState(null);
  const importInputRef = useRef(null);
  const isAdmin = user?.role === "admin";

  const loadAdmin = async () => {
    setLoading(true);
    setMessage("");

    try {
      const payload = await apiRequest("/api/admin/dashboard");
      setData({ ...emptyAdmin, ...payload });
      setUser((current) => ({ ...(current || getStoredUser() || {}), role: "admin" }));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const task = window.setTimeout(() => {
      loadAdmin();
    }, 0);

    return () => window.clearTimeout(task);
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (data.users || []).filter((item) => {
      const roleMatches = roleFilter === "all" || item.role === roleFilter;
      const textMatches =
        !term ||
        [item.name, item.email, item.phone, item.city, item.role, item.status]
          .join(" ")
          .toLowerCase()
          .includes(term);

      return roleMatches && textMatches;
    });
  }, [data.users, roleFilter, search]);

  const monthlyRevenue = useMemo(() => data.analytics?.monthlyRevenue || [], [data.analytics]);
  const monthlyLabels = useMemo(() => monthlyRevenue.map((item) => item.month), [monthlyRevenue]);
  const revenueValues = useMemo(
    () => monthlyRevenue.map((item) => Number(item.revenue || 0)),
    [monthlyRevenue],
  );
  const orderValues = useMemo(
    () => monthlyRevenue.map((item) => Number(item.orders || 0)),
    [monthlyRevenue],
  );

  const updateUserRole = async (target, patch) => {
    const nextUser = {
      role: target.role || "buyer",
      status: target.status || "active",
      verification_status: target.verification_status || "unverified",
      seller_status: target.seller_status || "none",
      commission_rate: Number(target.commission_rate || 10),
      ...patch,
    };

    try {
      await apiRequest(`/api/admin/users/${target.id}`, {
        method: "PATCH",
        body: JSON.stringify(nextUser),
      });
      setMessage("Utilisateur mis a jour.");
      await loadAdmin();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const updateProduct = async (product, patch, successMessage = "Produit mis a jour.") => {
    try {
      const payload = await apiRequest(`/api/admin/listings/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      await loadAdmin();
      if (productForm?.id === product.id && payload.listing) {
        setProductForm((current) => ({ ...current, ...productToForm(payload.listing) }));
      }
      setMessage(successMessage);
      return payload.listing;
    } catch (error) {
      setMessage(error.message);
      return null;
    }
  };

  const openProductDetail = (product) => {
    setProductForm(productToForm(product));
    setMessage("");
  };

  const updateProductField = (field, value) => {
    setProductForm((current) => ({ ...current, [field]: value }));
  };

  const saveProductDetail = async () => {
    if (!productForm?.id) {
      return;
    }

    const discountPercent = Number(
      String(productForm.discount_percent || "0").replace("%", "").replace("-", ""),
    );

    if (
      !Number.isInteger(discountPercent) ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      setMessage("Remise invalide. Entrez un nombre entre 0 et 100.");
      return;
    }

    await updateProduct(
      productForm,
      {
        title: productForm.title,
        category: productForm.category,
        brand: productForm.brand,
        model: productForm.model,
        year: formNumber(productForm.year),
        size: productForm.size,
        color: productForm.color,
        frame_material: productForm.frame_material,
        transmission: productForm.transmission,
        brakes: productForm.brakes,
        wheel_size: productForm.wheel_size,
        price: formNumber(productForm.price),
        discount_percent: discountPercent,
        stock_quantity: Math.max(0, Number(productForm.stock_quantity || 0)),
        condition: productForm.condition,
        location: productForm.location,
        description: productForm.description,
        image_url: productForm.image_url,
        contact_preference: productForm.contact_preference,
        status: productForm.status,
        is_featured: productForm.is_featured,
      },
      "Fiche produit enregistree.",
    );
  };

  const toggleFeaturedProduct = async (product) => {
    await updateProduct(
      product,
      {
        is_featured: !product.is_featured,
        status: "approved",
      },
      product.is_featured ? "Produit retire de la mise en avant." : "Produit mis en avant.",
    );
  };

  const updateProductDiscount = async (product) => {
    const answer = window.prompt(
      "Remise en pourcentage (0 a 100)",
      product.discount_percent ? String(product.discount_percent) : "",
    );

    if (answer === null) {
      return;
    }

    const discountPercent = Number(
      String(answer).replace("%", "").replace("-", "").trim() || 0,
    );

    if (
      !Number.isInteger(discountPercent) ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      setMessage("Entrez une remise entiere entre 0 et 100.");
      return;
    }

    await updateProduct(
      product,
      { discount_percent: discountPercent },
      discountPercent ? `Remise ${discountPercent}% appliquee.` : "Remise retiree.",
    );
  };

  const exportProducts = () => {
    const rows = [
      ["id", "sku", "title", "category", "brand", "price", "discount_percent", "status"],
      ...(data.products || []).map((product) => [
        product.id,
        `BK-${String(product.id).padStart(4, "0")}`,
        product.title || "",
        product.category || "",
        product.brand || "",
        product.price || 0,
        product.discount_percent || 0,
        product.status || "pending",
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    downloadTextFile("bisklet-produits.csv", csv, "text/csv");
    setMessage("Export catalogue telecharge.");
  };

  const handleImportExport = () => {
    const action = window.prompt("Tapez export pour telecharger ou import pour charger un JSON", "export");

    if (!action) {
      return;
    }

    if (action.trim().toLowerCase() === "import") {
      importInputRef.current?.click();
      return;
    }

    exportProducts();
  };

  const importProducts = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const products = Array.isArray(parsed) ? parsed : parsed.products;

      if (!Array.isArray(products)) {
        setMessage("Fichier JSON invalide. Utilisez un tableau ou { products: [...] }.");
        return;
      }

      const dataImport = await apiRequest("/api/admin/listings/import", {
        method: "POST",
        body: JSON.stringify({ products }),
      });
      await loadAdmin();
      setMessage(dataImport.message || "Import termine.");
    } catch (error) {
      setMessage(error.message || "Import impossible.");
    }
  };

  const conversionRate = data.metrics.totalUsers
    ? Math.round((Number(data.metrics.totalOrders || 0) / Number(data.metrics.totalUsers || 1)) * 100)
    : 0;
  const averageOrder = data.metrics.totalOrders
    ? Math.round(Number(data.metrics.totalRevenue || 0) / Number(data.metrics.totalOrders || 1))
    : 0;
  const compactRevenueOptions = useMemo(
    () => ({
      chart: {
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        toolbar: { show: false },
      },
      colors: ["#2563eb"],
      dataLabels: { enabled: false },
      grid: {
        borderColor: "#e5eaf0",
        strokeDashArray: 4,
      },
      noData: {
        text: "Aucune donnee",
        style: { color: "#64748b", fontSize: "14px" },
      },
      plotOptions: {
        bar: {
          borderRadius: 7,
          columnWidth: "46%",
        },
      },
      tooltip: {
        y: {
          formatter: (value) => money(value),
        },
      },
      xaxis: {
        categories: monthlyLabels,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: "#64748b", fontWeight: 800 },
        },
      },
      yaxis: {
        labels: {
          formatter: (value) => `${Math.round(value / 1000)}k`,
          style: { colors: "#64748b" },
        },
      },
    }),
    [monthlyLabels],
  );
  const compactRevenueSeries = useMemo(
    () => [{ name: "Revenus", data: revenueValues }],
    [revenueValues],
  );
  const performanceOptions = useMemo(
    () => ({
      chart: {
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        toolbar: { show: false },
      },
      colors: ["#2563eb", "#16a34a"],
      dataLabels: { enabled: false },
      grid: {
        borderColor: "#e5eaf0",
        strokeDashArray: 4,
      },
      labels: monthlyLabels,
      legend: {
        fontWeight: 800,
        labels: { colors: "#334155" },
        position: "top",
      },
      noData: {
        text: "Aucune donnee",
        style: { color: "#64748b", fontSize: "14px" },
      },
      plotOptions: {
        bar: {
          borderRadius: 7,
          columnWidth: "48%",
        },
      },
      stroke: {
        curve: "smooth",
        width: [0, 3],
      },
      tooltip: {
        shared: true,
        y: [
          { formatter: (value) => money(value) },
          { formatter: (value) => `${Math.round(value)} commandes` },
        ],
      },
      xaxis: {
        categories: monthlyLabels,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: "#64748b", fontWeight: 800 },
        },
      },
      yaxis: [
        {
          labels: {
            formatter: (value) => money(value),
            style: { colors: "#64748b" },
          },
          title: { text: "Revenus" },
        },
        {
          opposite: true,
          labels: {
            formatter: (value) => Math.round(value),
            style: { colors: "#64748b" },
          },
          title: { text: "Commandes" },
        },
      ],
    }),
    [monthlyLabels],
  );
  const performanceSeries = useMemo(
    () => [
      { name: "Revenus", type: "column", data: revenueValues },
      { name: "Commandes", type: "line", data: orderValues },
    ],
    [orderValues, revenueValues],
  );

  const metricCards = [
    {
      label: "Chiffre d'affaires",
      value: money(data.metrics.totalRevenue),
      note: "Commandes confirmees et ventes marketplace",
    },
    {
      label: "Commandes",
      value: data.metrics.totalOrders,
      note: `${data.metrics.pendingDeliveries} livraisons a suivre`,
    },
    {
      label: "Utilisateurs",
      value: data.metrics.totalUsers,
      note: `${conversionRate}% ratio commandes/utilisateurs`,
    },
    {
      label: "Vendeurs",
      value: data.metrics.totalSellers,
      note: "Comptes vendeurs et administrateurs actifs",
    },
    {
      label: "Livraisons en attente",
      value: data.metrics.pendingDeliveries,
      note: "Affectation transport et statut client",
    },
    {
      label: "Demandes de remboursement",
      value: data.metrics.refundRequests,
      note: "Litiges, retours et annulations",
    },
    {
      label: "Alertes stock",
      value: data.metrics.lowStockAlerts,
      note: "Produits a reapprovisionner",
    },
    {
      label: "Validations produit",
      value: data.metrics.pendingApprovals,
      note: "Annonces en moderation",
    },
  ];

  const controlCards = [
    {
      title: "Qualite catalogue",
      value: `${data.metrics.pendingApprovals} en attente`,
      text: "Verifier photos, prix, et descriptions avant publication.",
    },
    {
      title: "Panier moyen",
      value: money(averageOrder),
      text: "Suivre l'evolution des commandes boutique et accessoires.",
    },
    {
      title: "Risque operationnel",
      value: `${data.metrics.refundRequests + data.metrics.lowStockAlerts} alertes`,
      text: "Prioriser remboursements, stock faible et demandes client.",
    },
  ];

  return (
    <main className="site-shell admin-shell">
      <div className="contact-bar">
        <div className="contact-content">
          <span className="contact-item">Administration Bisklet</span>
          <span className="contact-item">Role: {roleLabels[user?.role] || "Invite"}</span>
        </div>
        <div className="social-icons">
          <a href="/my-account.html">Mon compte</a>
        </div>
      </div>

      <header className="topbar">
        <a className="brand" href="/accueil.html" aria-label="Bisklet accueil">
          <span className="brand-logo">B</span>
          <span className="brand-name">Bisklet</span>
        </a>
        <nav className="topnav" aria-label="Navigation admin">
          <a href="/accueil.html">ACCUEIL</a>
          <a href="/boutique.html">BOUTIQUE</a>
          <a href="/my-account.html">MY ACCOUNT</a>
          <a href="/admin-dashboard.html">ADMIN</a>
        </nav>
      </header>

      <section className="admin-hero">
        <div>
          <span className="section-kicker">Administration par role</span>
          <h1>Centre de controle marketplace</h1>
          <p>
            Supervisez les utilisateurs, vendeurs, annonces velo, commandes, revenus,
            validations, stocks, remboursements et priorites operationnelles avec une
            interface claire pour l'equipe Bisklet.
          </p>
          <div className="admin-hero-pills">
            <span>Permissions admin</span>
            <span>Moderation catalogue</span>
            <span>Suivi commandes</span>
            <span>Analytics revenus</span>
          </div>
        </div>
        <div className="admin-hero-card">
          <span>Acces admin</span>
          <strong>{isAdmin ? "Autorise" : "Bloque"}</strong>
          <p>{loading ? "Verification..." : "Controle base sur le role de session"}</p>
        </div>
      </section>

      {message && <div className="admin-message">{message}</div>}

      {!isAdmin && !loading ? (
        <section className="admin-access-card">
          <span className="section-kicker">Acces refuse</span>
          <h2>Role administrateur requis.</h2>
          <p>
            Connectez-vous avec un compte administrateur pour gerer la marketplace,
            les vendeurs, les produits et les commandes.
          </p>
          <a className="primary-link" href="/login.html">
            Se connecter
          </a>
        </section>
      ) : (
        <section className="admin-layout">
          <aside className="admin-sidebar">
            <div className="admin-profile">
              <span>{user?.name?.slice(0, 1) || "A"}</span>
              <div>
                <strong>{user?.name || "Admin"}</strong>
                <small>{user?.email}</small>
              </div>
            </div>
            <nav>
              {tabs.map((tab) => (
                <button
                  className={activeTab === tab.id ? "active" : ""}
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.label}</span>
                  <small>{tab.detail}</small>
                </button>
              ))}
            </nav>
          </aside>

          <div className="admin-panel">
            {activeTab === "overview" && (
              <div className="admin-section">
                <div className="admin-section-head">
                  <div>
                    <span className="section-kicker">Vue generale</span>
                    <h2>Tableau de bord operationnel</h2>
                    <p>Indicateurs essentiels pour piloter ventes, moderation et support.</p>
                  </div>
                  <button type="button" onClick={loadAdmin}>
                    Actualiser
                  </button>
                </div>

                <div className="admin-metric-grid">
                  {metricCards.map((metric) => (
                    <article key={metric.label}>
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                      <small>{metric.note}</small>
                    </article>
                  ))}
                </div>

                <div className="admin-control-grid">
                  {controlCards.map((card) => (
                    <article key={card.title}>
                      <span>{card.title}</span>
                      <strong>{card.value}</strong>
                      <p>{card.text}</p>
                    </article>
                  ))}
                </div>

                <div className="admin-overview-grid">
                  <section className="admin-chart-card">
                    <h3>Revenus mensuels</h3>
                    <p>Comparaison rapide des revenus et volumes commandes.</p>
                    <div className="admin-apex-chart">
                      <Chart
                        height={260}
                        options={compactRevenueOptions}
                        series={compactRevenueSeries}
                        type="bar"
                      />
                    </div>
                  </section>

                  <section className="admin-feed-card">
                    <h3>Activites recentes</h3>
                    {(data.activities || []).slice(0, 8).map((item, index) => (
                      <article key={`${item.title}-${index}`}>
                        <strong>{item.title}</strong>
                        <span>{item.detail}</span>
                        <small>{dateLabel(item.created_at)}</small>
                      </article>
                    ))}
                  </section>

                  <section className="admin-feed-card priority">
                    <h3>Priorites du jour</h3>
                    {(data.notifications || []).map((item) => (
                      <article key={item.title}>
                        <strong>{item.title}</strong>
                        <span>{item.body}</span>
                        <small>{readableStatus(item.level)}</small>
                      </article>
                    ))}
                  </section>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="admin-section">
                <div className="admin-section-head">
                  <div>
                    <span className="section-kicker">Gestion utilisateurs</span>
                    <h2>Profils, roles et permissions</h2>
                    <p>Recherchez un compte, modifiez son role et controlez son acces.</p>
                  </div>
                </div>
                <div className="admin-filters">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Rechercher nom, email, telephone..."
                  />
                  <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                    <option value="all">Tous les roles</option>
                    <option value="buyer">Acheteurs</option>
                    <option value="seller">Vendeurs</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
                <div className="admin-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Utilisateur</th>
                        <th>Role</th>
                        <th>Statut</th>
                        <th>Verification</th>
                        <th>Activite</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.name}</strong>
                            <span>{item.email}</span>
                            <small>{item.phone || item.city || "Profil incomplet"}</small>
                          </td>
                          <td><span className={statusClass(item.role)}>{readableStatus(item.role)}</span></td>
                          <td><span className={statusClass(item.status)}>{readableStatus(item.status)}</span></td>
                          <td>{readableStatus(item.verification_status || "unverified")}</td>
                          <td>{dateLabel(item.created_at)}</td>
                          <td>
                            <select
                              value={item.role || "buyer"}
                              onChange={(event) => updateUserRole(item, { role: event.target.value })}
                            >
                              <option value="buyer">Acheteur</option>
                              <option value="seller">Vendeur</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              type="button"
                              onClick={() =>
                                updateUserRole(item, {
                                  status: item.status === "active" ? "suspended" : "active",
                                })
                              }
                            >
                              {item.status === "active" ? "Suspendre" : "Activer"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "sellers" && (
              <div className="admin-section">
                <div className="admin-section-head">
                  <div>
                    <span className="section-kicker">Gestion vendeurs</span>
                    <h2>Candidatures, performances et commissions</h2>
                    <p>Validez les vendeurs, suivez leurs revenus et la qualite de boutique.</p>
                  </div>
                </div>
                <div className="admin-card-grid">
                  {(data.sellers || []).map((seller) => (
                    <article key={seller.id}>
                      <div className="admin-card-headline">
                        <h3>{seller.name}</h3>
                        <span className={statusClass(seller.seller_status || "approved")}>
                          {readableStatus(seller.seller_status || "approved")}
                        </span>
                      </div>
                      <p>{seller.email}</p>
                      <div className="admin-card-stats">
                        <span>{money(seller.earnings)} revenus</span>
                        <span>{seller.products || 0} produits</span>
                        <span>{seller.rating || 4.6}/5 note</span>
                        <span>{seller.commission_rate || 10}% commission</span>
                      </div>
                      <div className="admin-mini-list">
                        <span>Page boutique: /seller/{seller.id}</span>
                        <span>Reviews: suivi satisfaction et signalements</span>
                        <span>Workflow: candidature, verification, approbation</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateUserRole(seller, {
                            role: "seller",
                            seller_status: "approved",
                            verification_status: "verified",
                          })
                        }
                      >
                        Approuver vendeur
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <div className="admin-section">
                <div className="admin-section-head">
                  <div>
                    <span className="section-kicker">Gestion produits</span>
                    <h2>Velos, inventaire et validation catalogue</h2>
                    <p>Controlez les annonces, SKU, variantes, images, remises et stock.</p>
                  </div>
                  <button type="button" onClick={handleImportExport}>
                    Import / export
                  </button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept="application/json,.json"
                    hidden
                    onChange={importProducts}
                  />
                </div>
                {productForm && (
                  <section className="admin-product-detail">
                    <div
                      className="admin-product-preview"
                      style={
                        productForm.image_url
                          ? { backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.78)), url("${productForm.image_url}")` }
                          : undefined
                      }
                    >
                      <span>SKU BK-{String(productForm.id).padStart(4, "0")}</span>
                      <strong>{productForm.title || "Produit catalogue"}</strong>
                      <p>
                        {productForm.category || "Categorie"} / {productForm.brand || "Marque"}
                      </p>
                      <div>
                        <small>{money(productForm.price)}</small>
                        <small>
                          {productForm.discount_percent
                            ? `-${productForm.discount_percent}%`
                            : "Sans remise"}
                        </small>
                        <small>{readableStatus(productForm.status)}</small>
                      </div>
                    </div>

                    <div className="admin-product-editor">
                      <div className="admin-product-editor-head">
                        <div>
                          <span className="section-kicker">Fiche produit</span>
                          <h3>Details catalogue complets</h3>
                        </div>
                        <button type="button" onClick={() => setProductForm(null)}>
                          Fermer
                        </button>
                      </div>

                      <div className="admin-product-form">
                        <label className="wide">
                          <span>Titre</span>
                          <input
                            value={productForm.title}
                            onChange={(event) => updateProductField("title", event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Statut</span>
                          <select
                            value={productForm.status}
                            onChange={(event) => updateProductField("status", event.target.value)}
                          >
                            <option value="pending">En attente</option>
                            <option value="approved">Approuve</option>
                            <option value="rejected">Rejete</option>
                          </select>
                        </label>
                        <label>
                          <span>Mise en avant</span>
                          <select
                            value={productForm.is_featured ? "yes" : "no"}
                            onChange={(event) =>
                              updateProductField("is_featured", event.target.value === "yes")
                            }
                          >
                            <option value="no">Non</option>
                            <option value="yes">Oui</option>
                          </select>
                        </label>
                        <label>
                          <span>Categorie</span>
                          <input
                            value={productForm.category}
                            onChange={(event) => updateProductField("category", event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Marque</span>
                          <input
                            value={productForm.brand}
                            onChange={(event) => updateProductField("brand", event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Modele</span>
                          <input
                            value={productForm.model}
                            onChange={(event) => updateProductField("model", event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Annee</span>
                          <input
                            type="number"
                            value={productForm.year}
                            onChange={(event) => updateProductField("year", event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Prix DT</span>
                          <input
                            type="number"
                            value={productForm.price}
                            onChange={(event) => updateProductField("price", event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Remise %</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={productForm.discount_percent}
                            onChange={(event) =>
                              updateProductField("discount_percent", event.target.value)
                            }
                          />
                        </label>
                        <label>
                          <span>Stock</span>
                          <input
                            type="number"
                            min="0"
                            value={productForm.stock_quantity}
                            onChange={(event) =>
                              updateProductField("stock_quantity", event.target.value)
                            }
                          />
                        </label>
                        <label>
                          <span>Etat</span>
                          <input
                            value={productForm.condition}
                            onChange={(event) => updateProductField("condition", event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Taille</span>
                          <input
                            value={productForm.size}
                            onChange={(event) => updateProductField("size", event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Couleur</span>
                          <input
                            value={productForm.color}
                            onChange={(event) => updateProductField("color", event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Cadre</span>
                          <input
                            value={productForm.frame_material}
                            onChange={(event) =>
                              updateProductField("frame_material", event.target.value)
                            }
                          />
                        </label>
                        <label>
                          <span>Transmission</span>
                          <input
                            value={productForm.transmission}
                            onChange={(event) =>
                              updateProductField("transmission", event.target.value)
                            }
                          />
                        </label>
                        <label>
                          <span>Freins</span>
                          <input
                            value={productForm.brakes}
                            onChange={(event) => updateProductField("brakes", event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Roues</span>
                          <input
                            value={productForm.wheel_size}
                            onChange={(event) =>
                              updateProductField("wheel_size", event.target.value)
                            }
                          />
                        </label>
                        <label>
                          <span>Localisation</span>
                          <input
                            value={productForm.location}
                            onChange={(event) => updateProductField("location", event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Contact</span>
                          <select
                            value={productForm.contact_preference}
                            onChange={(event) =>
                              updateProductField("contact_preference", event.target.value)
                            }
                          >
                            <option value="phone">Telephone</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="email">Email</option>
                          </select>
                        </label>
                        <label className="wide">
                          <span>Image principale</span>
                          <input
                            value={productForm.image_url}
                            onChange={(event) =>
                              updateProductField("image_url", event.target.value)
                            }
                          />
                        </label>
                        <label className="wide">
                          <span>Description</span>
                          <textarea
                            rows="4"
                            value={productForm.description}
                            onChange={(event) =>
                              updateProductField("description", event.target.value)
                            }
                          />
                        </label>
                      </div>

                      <div className="admin-product-detail-actions">
                        <button type="button" onClick={saveProductDetail}>
                          Enregistrer la fiche
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            toggleFeaturedProduct({
                              ...productForm,
                              is_featured: productForm.is_featured,
                            })
                          }
                        >
                          {productForm.is_featured ? "Retirer avant" : "Mettre en avant"}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateProductDiscount(productForm)}
                        >
                          Remise rapide
                        </button>
                      </div>
                    </div>
                  </section>
                )}
                <div className="admin-card-grid products">
                  {(data.products || []).map((product) => (
                    <article key={product.id}>
                      <div className="admin-card-headline">
                        <h3>{product.title}</h3>
                        <span className={statusClass(product.status)}>{readableStatus(product.status)}</span>
                      </div>
                      <p>{product.category || "Velo"} / {product.brand || "Marque non renseignee"}</p>
                      <div className="admin-card-stats">
                        <span>{money(product.price)}</span>
                        <span>SKU BK-{String(product.id).padStart(4, "0")}</span>
                        <span>{product.discount_percent ? `Remise: ${product.discount_percent}%` : "Remise: 0%"}</span>
                        <span>{product.is_featured ? "Mis en avant" : "Non mis en avant"}</span>
                        <span>{product.condition || "Inventaire"}</span>
                        <span>Stock: suivi manuel</span>
                        <span>
                          Variantes: {product.size || "taille"} / {product.color || "couleur"}
                        </span>
                        <span>{product.image_url ? "Galerie: image principale" : "Galerie: a completer"}</span>
                      </div>
                      <div className="admin-card-actions">
                        <button type="button" onClick={() => openProductDetail(product)}>
                          Modifier
                        </button>
                        <button type="button" onClick={() => toggleFeaturedProduct(product)}>
                          {product.is_featured ? "Retirer avant" : "Mettre en avant"}
                        </button>
                        <button type="button" onClick={() => updateProductDiscount(product)}>
                          Remise
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="admin-section">
                <div className="admin-section-head">
                  <div>
                    <span className="section-kicker">Gestion commandes</span>
                    <h2>Suivi commandes, statuts et livraison</h2>
                    <p>Gardez une vision claire des commandes, clients et montants.</p>
                  </div>
                </div>
                <div className="admin-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Commande</th>
                        <th>Client</th>
                        <th>Total</th>
                        <th>Statut</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.orders || []).map((order) => (
                        <tr key={order.id}>
                          <td>
                            <strong>#{order.id}</strong>
                            <span>{order.title || order.product_title || "Commande boutique"}</span>
                          </td>
                          <td>{order.customer_name || order.user_name || order.customer_email || "-"}</td>
                          <td>{money(order.total)}</td>
                          <td><span className={statusClass(order.status)}>{readableStatus(order.status)}</span></td>
                          <td>{dateLabel(order.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="admin-section">
                <div className="admin-section-head">
                  <div>
                    <span className="section-kicker">Analytics ventes</span>
                    <h2>Graphique revenus et performance commerciale</h2>
                    <p>Analysez revenus mensuels, panier moyen et repartition marketplace.</p>
                  </div>
                </div>
                <div className="admin-analytics-grid">
                  <section className="admin-chart-card wide">
                    <h3>Graphique revenus mensuels</h3>
                    <div className="admin-apex-chart large">
                      <Chart
                        height={350}
                        options={performanceOptions}
                        series={performanceSeries}
                        type="line"
                      />
                    </div>
                  </section>
                  <section className="admin-feed-card">
                    <h3>Indicateurs commerciaux</h3>
                    <article>
                      <strong>Panier moyen</strong>
                      <span>{money(averageOrder)}</span>
                      <small>Base commandes actuelles</small>
                    </article>
                    <article>
                      <strong>Conversion operationnelle</strong>
                      <span>{conversionRate}%</span>
                      <small>Commandes / utilisateurs</small>
                    </article>
                    <article>
                      <strong>Commission vendeurs</strong>
                      <span>Controlee par role vendeur</span>
                      <small>Configurable dans la section vendeurs</small>
                    </article>
                  </section>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="admin-section">
                <div className="admin-section-head">
                  <div>
                    <span className="section-kicker">Panneau notifications</span>
                    <h2>Alertes necessitant une action</h2>
                    <p>Priorisez validations, livraisons, remboursements et stock faible.</p>
                  </div>
                </div>
                <div className="admin-card-grid">
                  {(data.notifications || []).map((item) => (
                    <article key={item.title}>
                      <div className="admin-card-headline">
                        <h3>{item.title}</h3>
                        <span className={statusClass(item.level)}>{readableStatus(item.level)}</span>
                      </div>
                      <p>{item.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default AdminDashboardPage;
