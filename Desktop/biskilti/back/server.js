import { createServer } from "node:http";
import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const databaseDir = join(__dirname, "database");
const databasePath = join(databaseDir, "bisklet.sqlite");
const publicDir = join(__dirname, "public");
const listingUploadsDir = join(publicDir, "uploads", "listings");
const port = Number(process.env.PORT || 8000);

mkdirSync(databaseDir, { recursive: true });
mkdirSync(listingUploadsDir, { recursive: true });

const db = new DatabaseSync(databasePath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    city TEXT,
    preferred_contact TEXT DEFAULT 'phone',
    role TEXT DEFAULT 'buyer',
    status TEXT DEFAULT 'active',
    verification_status TEXT DEFAULT 'unverified',
    seller_status TEXT DEFAULT 'none',
    commission_rate INTEGER DEFAULT 10,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    rental_title TEXT NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    booking_date TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_title TEXT NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    total INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    category TEXT,
    brand TEXT,
    model TEXT,
    year INTEGER,
    size TEXT,
    color TEXT,
    frame_material TEXT,
    transmission TEXT,
    brakes TEXT,
    wheel_size TEXT,
    price INTEGER,
    discount_percent INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    stock_quantity INTEGER DEFAULT 1,
    condition TEXT,
    location TEXT,
    description TEXT,
    image_url TEXT,
    contact_preference TEXT DEFAULT 'phone',
    status TEXT DEFAULT 'pending',
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS exchange_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    offered_item TEXT NOT NULL,
    wanted_item TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS contact_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    topic TEXT NOT NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );
`);

function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();

  if (!columns.some((item) => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn("users", "address", "TEXT");
ensureColumn("users", "city", "TEXT");
ensureColumn("users", "preferred_contact", "TEXT DEFAULT 'phone'");
ensureColumn("users", "role", "TEXT DEFAULT 'buyer'");
ensureColumn("users", "status", "TEXT DEFAULT 'active'");
ensureColumn("users", "verification_status", "TEXT DEFAULT 'unverified'");
ensureColumn("users", "seller_status", "TEXT DEFAULT 'none'");
ensureColumn("users", "commission_rate", "INTEGER DEFAULT 10");
ensureColumn("listings", "brand", "TEXT");
ensureColumn("listings", "model", "TEXT");
ensureColumn("listings", "year", "INTEGER");
ensureColumn("listings", "size", "TEXT");
ensureColumn("listings", "color", "TEXT");
ensureColumn("listings", "frame_material", "TEXT");
ensureColumn("listings", "transmission", "TEXT");
ensureColumn("listings", "brakes", "TEXT");
ensureColumn("listings", "wheel_size", "TEXT");
ensureColumn("listings", "image_url", "TEXT");
ensureColumn("listings", "contact_preference", "TEXT DEFAULT 'phone'");
ensureColumn("listings", "discount_percent", "INTEGER DEFAULT 0");
ensureColumn("listings", "is_featured", "INTEGER DEFAULT 0");
ensureColumn("listings", "stock_quantity", "INTEGER DEFAULT 1");

function seedDefaultUser() {
  const existingUser = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get("password@gmail.com");

  if (existingUser) {
    db.prepare(
      `UPDATE users
       SET role = 'admin', status = 'active', verification_status = 'verified'
       WHERE email = ?`,
    ).run("password@gmail.com");
    return;
  }

  const passwordData = hashPassword("pass");

  db.prepare(
    `INSERT INTO users
     (name, email, phone, role, status, verification_status, password_hash, password_salt, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    "Admin User",
    "password@gmail.com",
    "+216 00 000 000",
    "admin",
    "active",
    "verified",
    passwordData.hash,
    passwordData.salt,
    new Date().toISOString(),
  );
}

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": process.env.FRONTEND_ORIGIN || "http://127.0.0.1:5173",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function sendJson(response, status, payload) {
  response.writeHead(status, jsonHeaders);
  response.end(JSON.stringify(payload));
}

function sendStaticUpload(response, pathname) {
  const match = pathname.match(/^\/uploads\/listings\/([a-zA-Z0-9._-]+)$/);

  if (!match) {
    return false;
  }

  const filePath = join(listingUploadsDir, match[1]);

  if (!existsSync(filePath)) {
    return false;
  }

  const extension = match[1].split(".").pop()?.toLowerCase();
  const contentTypes = {
    gif: "image/gif",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };

  response.writeHead(200, {
    "Content-Type": contentTypes[extension] || "application/octet-stream",
    "Access-Control-Allow-Origin": jsonHeaders["Access-Control-Allow-Origin"],
  });
  response.end(readFileSync(filePath));
  return true;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeDiscountPercent(value) {
  const discountPercent = Number(value || 0);

  if (!Number.isInteger(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    return null;
  }

  return discountPercent;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    address: user.address || "",
    city: user.city || "",
    preferredContact: user.preferred_contact || "phone",
    role: user.role || "buyer",
    status: user.status || "active",
    verificationStatus: user.verification_status || "unverified",
    sellerStatus: user.seller_status || "none",
    commissionRate: Number(user.commission_rate || 10),
    createdAt: user.created_at,
  };
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  return {
    salt,
    hash: scryptSync(password, salt, 64).toString("hex"),
  };
}

function passwordMatches(password, user) {
  const candidate = hashPassword(password, user.password_salt).hash;
  const saved = Buffer.from(user.password_hash, "hex");
  const incoming = Buffer.from(candidate, "hex");

  return saved.length === incoming.length && timingSafeEqual(saved, incoming);
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

async function readBody(request) {
  let body = "";

  for await (const chunk of request) {
    body += chunk;

    if (body.length > 7_000_000) {
      throw new Error("Request body too large.");
    }
  }

  return body ? JSON.parse(body) : {};
}

function createSession(userId) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  db.prepare(
    "INSERT INTO sessions (user_id, token_hash, created_at) VALUES (?, ?, ?)",
  ).run(userId, tokenHash, new Date().toISOString());

  return token;
}

function userFromRequest(request) {
  const authorization = request.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  if (!token) {
    return null;
  }

  return db
    .prepare(
      `SELECT users.id, users.name, users.email, users.phone, users.created_at
              , users.address, users.city, users.preferred_contact, users.role
              , users.status, users.verification_status, users.seller_status
              , users.commission_rate
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ?`,
    )
    .get(hashToken(token));
}

function rowCount(sql, params = []) {
  return db.prepare(sql).get(...params).total || 0;
}

function recentRows(sql, params = []) {
  return db.prepare(sql).all(...params);
}

function accountPayload(user) {
  const email = user.email;
  const userId = user.id;
  const bookings = recentRows(
    `SELECT id, rental_title AS title, booking_date, status, notes, created_at
     FROM bookings
     WHERE user_id = ? OR customer_email = ?
     ORDER BY id DESC
     LIMIT 20`,
    [userId, email],
  );
  const orders = recentRows(
    `SELECT id, product_title AS title, total, status, notes, created_at
     FROM orders
     WHERE user_id = ? OR customer_email = ?
     ORDER BY id DESC
     LIMIT 20`,
    [userId, email],
  );
  const listings = recentRows(
    `SELECT id, title, category, brand, model, year, size, color,
            frame_material, transmission, brakes, wheel_size, price,
            discount_percent, condition, location, description, image_url, contact_preference,
            status, created_at
     FROM listings
     WHERE user_id = ?
     ORDER BY id DESC
     LIMIT 20`,
    [userId],
  );
  const exchanges = recentRows(
    `SELECT id, offered_item, wanted_item, status, description, created_at
     FROM exchange_requests
     WHERE user_id = ?
     ORDER BY id DESC
     LIMIT 20`,
    [userId],
  );
  const contacts = recentRows(
    `SELECT id, topic, status, message, created_at
     FROM contact_requests
     WHERE user_id = ? OR email = ?
     ORDER BY id DESC
     LIMIT 20`,
    [userId, email],
  );

  return {
    user: publicUser(user),
    stats: {
      bookings: rowCount(
        "SELECT COUNT(*) AS total FROM bookings WHERE user_id = ? OR customer_email = ?",
        [userId, email],
      ),
      orders: rowCount(
        "SELECT COUNT(*) AS total FROM orders WHERE user_id = ? OR customer_email = ?",
        [userId, email],
      ),
      listings: rowCount("SELECT COUNT(*) AS total FROM listings WHERE user_id = ?", [
        userId,
      ]),
      exchanges: rowCount(
        "SELECT COUNT(*) AS total FROM exchange_requests WHERE user_id = ?",
        [userId],
      ),
      contacts: rowCount(
        "SELECT COUNT(*) AS total FROM contact_requests WHERE user_id = ? OR email = ?",
        [userId, email],
      ),
    },
    activity: { bookings, orders, listings, exchanges, contacts },
  };
}

function requireAdmin(request, response) {
  const user = userFromRequest(request);

  if (!user) {
    sendJson(response, 401, { message: "Non connecte." });
    return null;
  }

  if (user.role !== "admin") {
    sendJson(response, 403, { message: "Acces admin requis." });
    return null;
  }

  return user;
}

function monthlyRevenue() {
  const rows = recentRows(
    `SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue, COUNT(*) AS orders
     FROM orders
     GROUP BY month
     ORDER BY month DESC
     LIMIT 6`,
  ).reverse();

  if (rows.length) {
    return rows;
  }

  return [
    { month: "Jan", revenue: 2800, orders: 9 },
    { month: "Feb", revenue: 3600, orders: 11 },
    { month: "Mar", revenue: 4100, orders: 13 },
    { month: "Apr", revenue: 5200, orders: 15 },
    { month: "May", revenue: 6700, orders: 18 },
    { month: "Jun", revenue: 7400, orders: 21 },
  ];
}

function adminPayload() {
  const users = recentRows(
    `SELECT id, name, email, phone, city, role, status, verification_status,
            seller_status, commission_rate, created_at
     FROM users
     ORDER BY id DESC`,
  );
  const orders = recentRows(
    `SELECT orders.id, orders.product_title AS title, orders.customer_name,
            orders.customer_email, orders.total, orders.status, orders.created_at,
            users.name AS user_name
     FROM orders
     LEFT JOIN users ON users.id = orders.user_id
     ORDER BY orders.id DESC
     LIMIT 50`,
  );
  const products = recentRows(
    `SELECT listings.id, listings.title, listings.category, listings.brand,
            listings.model, listings.year, listings.size, listings.color,
            listings.frame_material, listings.transmission, listings.brakes,
            listings.wheel_size,
            listings.price, listings.discount_percent, listings.is_featured,
            listings.stock_quantity,
            listings.condition, listings.location, listings.status,
            listings.description, listings.image_url, listings.contact_preference,
            listings.created_at,
            users.name AS seller_name
     FROM listings
     LEFT JOIN users ON users.id = listings.user_id
     ORDER BY listings.is_featured DESC, listings.id DESC
     LIMIT 50`,
  );
  const sellerUsers = users.filter((item) => item.role === "seller" || item.role === "admin");
  const pendingListings = products.filter((item) => item.status === "pending").length;
  const pendingOrders = orders.filter((item) => item.status === "pending").length;
  const revenue = orders.reduce((total, order) => total + Number(order.total || 0), 0);
  const activities = [
    ...orders.slice(0, 4).map((order) => ({
      type: "order",
      title: `Commande #${order.id}`,
      detail: `${order.title || "Produit"} - ${order.status}`,
      created_at: order.created_at,
    })),
    ...products.slice(0, 4).map((product) => ({
      type: "product",
      title: product.title,
      detail: `${product.seller_name || "Seller"} - ${product.status}`,
      created_at: product.created_at,
    })),
    ...users.slice(0, 4).map((item) => ({
      type: "user",
      title: item.name,
      detail: `${item.role} - ${item.status}`,
      created_at: item.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 10);

  return {
    metrics: {
      totalRevenue: revenue,
      totalOrders: rowCount("SELECT COUNT(*) AS total FROM orders"),
      totalUsers: users.length,
      totalSellers: sellerUsers.length,
      pendingDeliveries: pendingOrders,
      refundRequests: rowCount(
        "SELECT COUNT(*) AS total FROM orders WHERE status IN ('refund', 'cancelled')",
      ),
      lowStockAlerts: Math.max(0, 6 - products.length),
      pendingApprovals: pendingListings,
    },
    analytics: {
      monthlyRevenue: monthlyRevenue(),
      salesChannels: [
        { label: "Boutique", value: Math.max(orders.length, 1) },
        { label: "Annonces", value: Math.max(products.length, 1) },
        { label: "Location", value: rowCount("SELECT COUNT(*) AS total FROM bookings") },
      ],
    },
    notifications: [
      {
        title: "Produits en attente",
        body: `${pendingListings} annonces doivent etre verifiees.`,
        level: pendingListings ? "warning" : "info",
      },
      {
        title: "Livraisons",
        body: `${pendingOrders} commandes sont encore en attente.`,
        level: pendingOrders ? "warning" : "info",
      },
      {
        title: "Stock",
        body: `${Math.max(0, 6 - products.length)} alertes stock a verifier.`,
        level: "info",
      },
    ],
    users,
    sellers: sellerUsers.map((seller) => ({
      ...seller,
      earnings: orders
        .filter((order) => order.customer_email === seller.email)
        .reduce((total, order) => total + Number(order.total || 0), 0),
      products: products.filter((product) => product.seller_name === seller.name).length,
      rating: seller.role === "admin" ? 5 : 4.6,
    })),
    products,
    orders,
    activities,
  };
}

function handleAdminDashboard(request, response) {
  if (!requireAdmin(request, response)) {
    return;
  }

  return sendJson(response, 200, adminPayload());
}

async function handleAdminUserUpdate(request, response, userId) {
  if (!requireAdmin(request, response)) {
    return;
  }

  const body = await readBody(request);
  const role = ["buyer", "seller", "admin"].includes(body.role) ? body.role : "buyer";
  const status = ["active", "suspended", "banned"].includes(body.status)
    ? body.status
    : "active";
  const verificationStatus = ["unverified", "pending", "verified"].includes(
    body.verification_status,
  )
    ? body.verification_status
    : "unverified";
  const sellerStatus = ["none", "pending", "approved", "rejected"].includes(
    body.seller_status,
  )
    ? body.seller_status
    : role === "seller"
      ? "approved"
      : "none";
  const commissionRate = Math.max(0, Math.min(50, Number(body.commission_rate || 10)));

  db.prepare(
    `UPDATE users
     SET role = ?, status = ?, verification_status = ?, seller_status = ?, commission_rate = ?
     WHERE id = ?`,
  ).run(role, status, verificationStatus, sellerStatus, commissionRate, userId);

  const updated = db
    .prepare(
      `SELECT id, name, email, phone, city, role, status, verification_status,
              seller_status, commission_rate, created_at
       FROM users
       WHERE id = ?`,
    )
    .get(userId);

  return sendJson(response, 200, {
    message: "Utilisateur mis a jour.",
    user: updated,
  });
}

async function handleAdminListingUpdate(request, response, listingId) {
  if (!requireAdmin(request, response)) {
    return;
  }

  const body = await readBody(request);
  const existing = db.prepare("SELECT * FROM listings WHERE id = ?").get(listingId);

  if (!existing) {
    return sendJson(response, 404, { message: "Produit introuvable." });
  }

  const status = ["pending", "approved", "rejected"].includes(body.status)
    ? body.status
    : existing.status;
  const discountPercent =
    body.discount_percent === undefined
      ? Number(existing.discount_percent || 0)
      : normalizeDiscountPercent(body.discount_percent);

  if (discountPercent === null) {
    return sendJson(response, 422, { message: "Pourcentage invalide." });
  }

  db.prepare(
    `UPDATE listings
     SET title = ?, category = ?, brand = ?, model = ?, year = ?, size = ?,
         color = ?, frame_material = ?, transmission = ?, brakes = ?, wheel_size = ?,
         price = ?, discount_percent = ?, is_featured = ?, stock_quantity = ?,
         condition = ?, location = ?, description = ?, image_url = ?,
         contact_preference = ?, status = ?
     WHERE id = ?`,
  ).run(
    body.title ?? existing.title,
    body.category ?? existing.category,
    body.brand ?? existing.brand,
    body.model ?? existing.model,
    body.year === undefined ? existing.year : body.year ? Number(body.year) : null,
    body.size ?? existing.size,
    body.color ?? existing.color,
    body.frame_material ?? existing.frame_material,
    body.transmission ?? existing.transmission,
    body.brakes ?? existing.brakes,
    body.wheel_size ?? existing.wheel_size,
    body.price === undefined ? existing.price : body.price ? Number(body.price) : null,
    discountPercent,
    body.is_featured === undefined
      ? Number(existing.is_featured || 0)
      : body.is_featured
        ? 1
        : 0,
    body.stock_quantity === undefined
      ? Number(existing.stock_quantity ?? 1)
      : Math.max(0, Number(body.stock_quantity || 0)),
    body.condition ?? existing.condition,
    body.location ?? existing.location,
    body.description ?? existing.description,
    body.image_url ?? existing.image_url,
    body.contact_preference ?? existing.contact_preference,
    status,
    listingId,
  );

  const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(listingId);

  return sendJson(response, 200, {
    message: "Produit mis a jour.",
    listing,
  });
}

async function handleAdminListingImport(request, response) {
  const admin = requireAdmin(request, response);

  if (!admin) {
    return;
  }

  const body = await readBody(request);
  const products = Array.isArray(body.products) ? body.products.slice(0, 50) : [];

  if (!products.length) {
    return sendJson(response, 422, { message: "Aucun produit a importer." });
  }

  let created = 0;

  for (const product of products) {
    const title = String(product.title || "").trim();

    if (!title) {
      continue;
    }

    const discountPercent = normalizeDiscountPercent(product.discount_percent);

    db.prepare(
      `INSERT INTO listings
       (user_id, title, category, brand, model, price, discount_percent,
        stock_quantity, condition, location, image_url, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      admin.id,
      title,
      product.category || null,
      product.brand || null,
      product.model || null,
      product.price ? Number(product.price) : null,
      discountPercent ?? 0,
      Math.max(0, Number(product.stock_quantity ?? 1)),
      product.condition || null,
      product.location || null,
      product.image_url || null,
      "pending",
      new Date().toISOString(),
    );
    created += 1;
  }

  return sendJson(response, 201, {
    message: `${created} produits importes.`,
  });
}

async function handleRegister(request, response) {
  const body = await readBody(request);
  const name = String(body.name || "").trim();
  const email = normalizeEmail(body.email);
  const phone = String(body.phone || "").trim();
  const password = String(body.password || "");

  if (name.length < 2) {
    return sendJson(response, 422, { message: "Le nom est obligatoire." });
  }

  if (!email.includes("@")) {
    return sendJson(response, 422, { message: "Email invalide." });
  }

  if (password.length < 4) {
    return sendJson(response, 422, {
      message: "Le mot de passe doit contenir au moins 4 caracteres.",
    });
  }

  const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email);

  if (existingUser) {
    return sendJson(response, 409, { message: "Cet email existe deja." });
  }

  const passwordData = hashPassword(password);
  const result = db
    .prepare(
      `INSERT INTO users
       (name, email, phone, role, status, verification_status, password_hash, password_salt, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      name,
      email,
      phone,
      "buyer",
      "active",
      "unverified",
      passwordData.hash,
      passwordData.salt,
      new Date().toISOString(),
    );

  const user = db
    .prepare(
      `SELECT id, name, email, phone, role, status, verification_status,
              seller_status, commission_rate, created_at
       FROM users
       WHERE id = ?`,
    )
    .get(result.lastInsertRowid);

  return sendJson(response, 201, {
    message: "Compte cree avec succes.",
    token: createSession(user.id),
    user: publicUser(user),
  });
}

async function handleLogin(request, response) {
  const body = await readBody(request);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user || !passwordMatches(password, user)) {
    return sendJson(response, 401, { message: "Email ou mot de passe incorrect." });
  }

  return sendJson(response, 200, {
    message: "Connexion reussie.",
    token: createSession(user.id),
    user: publicUser(user),
  });
}

function handleMe(request, response) {
  const user = userFromRequest(request);

  if (!user) {
    return sendJson(response, 401, { message: "Non connecte." });
  }

  return sendJson(response, 200, { user: publicUser(user) });
}

function handleAccount(request, response) {
  const user = userFromRequest(request);

  if (!user) {
    return sendJson(response, 401, { message: "Non connecte." });
  }

  return sendJson(response, 200, accountPayload(user));
}

async function handleProfileUpdate(request, response) {
  const user = userFromRequest(request);

  if (!user) {
    return sendJson(response, 401, { message: "Non connecte." });
  }

  const body = await readBody(request);
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const address = String(body.address || "").trim();
  const city = String(body.city || "").trim();
  const preferredContact = String(body.preferredContact || "phone").trim();

  if (name.length < 2) {
    return sendJson(response, 422, { message: "Le nom est obligatoire." });
  }

  db.prepare(
    `UPDATE users
     SET name = ?, phone = ?, address = ?, city = ?, preferred_contact = ?
     WHERE id = ?`,
  ).run(name, phone, address, city, preferredContact, user.id);

  const updatedUser = db
    .prepare(
      `SELECT id, name, email, phone, address, city, preferred_contact, created_at
       FROM users
       WHERE id = ?`,
    )
    .get(user.id);

  return sendJson(response, 200, {
    message: "Profil mis a jour.",
    user: publicUser(updatedUser),
    account: accountPayload(updatedUser),
  });
}

function handleLogout(request, response) {
  const authorization = request.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  if (token) {
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  }

  return sendJson(response, 200, { message: "Deconnecte." });
}

async function handleBookingCreate(request, response) {
  const body = await readBody(request);
  const user = userFromRequest(request);
  const title = String(body.rental_title || "").trim();

  if (!title) {
    return sendJson(response, 422, { message: "Offre de location obligatoire." });
  }

  const result = db
    .prepare(
      `INSERT INTO bookings
       (user_id, rental_title, customer_name, customer_email, customer_phone, booking_date, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      user?.id || null,
      title,
      body.customer_name || user?.name || null,
      body.customer_email || user?.email || null,
      body.customer_phone || user?.phone || null,
      body.booking_date || null,
      "pending",
      body.notes || null,
      new Date().toISOString(),
    );

  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(result.lastInsertRowid);

  return sendJson(response, 201, {
    message: "Booking cree avec succes.",
    booking,
  });
}

async function handleOrderCreate(request, response) {
  const body = await readBody(request);
  const user = userFromRequest(request);
  const title = String(body.product_title || "").trim();

  if (!title) {
    return sendJson(response, 422, { message: "Produit obligatoire." });
  }

  const result = db
    .prepare(
      `INSERT INTO orders
       (user_id, product_title, customer_name, customer_email, customer_phone, total, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      user?.id || null,
      title,
      body.customer_name || user?.name || null,
      body.customer_email || user?.email || null,
      body.customer_phone || user?.phone || null,
      Number(body.total || 0),
      "pending",
      body.notes || null,
      new Date().toISOString(),
    );

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(result.lastInsertRowid);

  return sendJson(response, 201, {
    message: "Demande produit envoyee.",
    order,
  });
}

function handleListingIndex(response) {
  const listings = recentRows(
    `SELECT listings.id, listings.title, listings.category, listings.brand,
            listings.model, listings.year, listings.size, listings.color,
            listings.frame_material, listings.transmission, listings.brakes,
            listings.wheel_size, listings.price, listings.discount_percent, listings.condition,
            listings.location, listings.description, listings.image_url,
            listings.contact_preference, listings.status, listings.created_at,
            users.name AS seller_name
     FROM listings
     LEFT JOIN users ON users.id = listings.user_id
     ORDER BY listings.id DESC
     LIMIT 100`,
  );

  return sendJson(response, 200, { listings });
}

async function handleListingCreate(request, response) {
  const body = await readBody(request);
  const user = userFromRequest(request);
  const title = String(body.title || "").trim();

  if (!user) {
    return sendJson(response, 401, { message: "Non connecte." });
  }

  if (!title) {
    return sendJson(response, 422, { message: "Titre annonce obligatoire." });
  }

  const discountPercent = normalizeDiscountPercent(body.discount_percent);

  if (discountPercent === null) {
    return sendJson(response, 422, { message: "Pourcentage invalide." });
  }

  const result = db
    .prepare(
      `INSERT INTO listings
       (user_id, title, category, brand, model, year, size, color, frame_material, transmission, brakes, wheel_size, price, discount_percent, condition, location, description, image_url, contact_preference, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      user.id,
      title,
      body.category || null,
      body.brand || null,
      body.model || null,
      body.year ? Number(body.year) : null,
      body.size || null,
      body.color || null,
      body.frame_material || null,
      body.transmission || null,
      body.brakes || null,
      body.wheel_size || null,
      body.price ? Number(body.price) : null,
      discountPercent,
      body.condition || null,
      body.location || null,
      body.description || null,
      body.image_url || null,
      body.contact_preference || "phone",
      "pending",
      new Date().toISOString(),
    );

  const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(result.lastInsertRowid);

  return sendJson(response, 201, {
    message: "Annonce creee avec succes.",
    listing,
  });
}

async function handleListingUpdate(request, response, listingId) {
  const body = await readBody(request);
  const user = userFromRequest(request);

  if (!user) {
    return sendJson(response, 401, { message: "Non connecte." });
  }

  const existingListing = db
    .prepare("SELECT * FROM listings WHERE id = ? AND user_id = ?")
    .get(listingId, user.id);

  if (!existingListing) {
    return sendJson(response, 404, { message: "Annonce introuvable pour ce compte." });
  }

  const title = String(body.title || "").trim();

  if (!title) {
    return sendJson(response, 422, { message: "Titre annonce obligatoire." });
  }

  const discountPercent = normalizeDiscountPercent(body.discount_percent);

  if (discountPercent === null) {
    return sendJson(response, 422, { message: "Pourcentage invalide." });
  }

  db.prepare(
    `UPDATE listings
     SET title = ?, category = ?, brand = ?, model = ?, year = ?, size = ?,
         color = ?, frame_material = ?, transmission = ?, brakes = ?,
         wheel_size = ?, price = ?, discount_percent = ?, condition = ?, location = ?, description = ?,
         image_url = ?, contact_preference = ?, status = ?
     WHERE id = ? AND user_id = ?`,
  ).run(
    title,
    body.category || null,
    body.brand || null,
    body.model || null,
    body.year ? Number(body.year) : null,
    body.size || null,
    body.color || null,
    body.frame_material || null,
    body.transmission || null,
    body.brakes || null,
    body.wheel_size || null,
    body.price ? Number(body.price) : null,
    discountPercent,
    body.condition || null,
    body.location || null,
    body.description || null,
    body.image_url || null,
    body.contact_preference || "phone",
    "pending",
    listingId,
    user.id,
  );

  const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(listingId);

  return sendJson(response, 200, {
    message: "Annonce mise a jour.",
    listing,
  });
}

async function handleListingImageUpload(request, response) {
  const body = await readBody(request);
  const dataUrl = String(body.data_url || "");
  const fileName = String(body.file_name || "listing-image").toLowerCase();
  const match = dataUrl.match(/^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/);

  if (!match) {
    return sendJson(response, 422, { message: "Image invalide." });
  }

  const extension = match[1] === "jpeg" ? "jpg" : match[1];
  const imageBuffer = Buffer.from(match[2], "base64");

  if (imageBuffer.length > 5 * 1024 * 1024) {
    return sendJson(response, 422, { message: "Image trop grande. Maximum 5 MB." });
  }

  const safeBaseName =
    fileName
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "listing-image";
  const storedName = `${Date.now()}-${randomBytes(4).toString("hex")}-${safeBaseName}.${extension}`;
  const storedPath = join(listingUploadsDir, storedName);

  writeFileSync(storedPath, imageBuffer);

  return sendJson(response, 201, {
    message: "Image ajoutee.",
    image_url: `http://127.0.0.1:${port}/uploads/listings/${storedName}`,
  });
}

async function handleExchangeCreate(request, response) {
  const body = await readBody(request);
  const user = userFromRequest(request);
  const offeredItem = String(body.offered_item || "").trim();

  if (!offeredItem) {
    return sendJson(response, 422, { message: "Objet propose obligatoire." });
  }

  const result = db
    .prepare(
      `INSERT INTO exchange_requests
       (user_id, offered_item, wanted_item, description, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      user?.id || null,
      offeredItem,
      body.wanted_item || null,
      body.description || null,
      "pending",
      new Date().toISOString(),
    );

  const exchange = db
    .prepare("SELECT * FROM exchange_requests WHERE id = ?")
    .get(result.lastInsertRowid);

  return sendJson(response, 201, {
    message: "Demande d echange envoyee.",
    exchange,
  });
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      response.writeHead(204, jsonHeaders);
      return response.end();
    }

    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "GET" && sendStaticUpload(response, url.pathname)) {
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/register") {
      return await handleRegister(request, response);
    }

    if (request.method === "POST" && url.pathname === "/api/login") {
      return await handleLogin(request, response);
    }

    if (request.method === "GET" && url.pathname === "/api/me") {
      return handleMe(request, response);
    }

    if (request.method === "GET" && url.pathname === "/api/account") {
      return handleAccount(request, response);
    }

    if (request.method === "GET" && url.pathname === "/api/admin/dashboard") {
      return handleAdminDashboard(request, response);
    }

    const adminUserMatch = url.pathname.match(/^\/api\/admin\/users\/(\d+)$/);

    if (request.method === "PATCH" && adminUserMatch) {
      return await handleAdminUserUpdate(request, response, Number(adminUserMatch[1]));
    }

    const adminListingMatch = url.pathname.match(/^\/api\/admin\/listings\/(\d+)$/);

    if (request.method === "PATCH" && adminListingMatch) {
      return await handleAdminListingUpdate(request, response, Number(adminListingMatch[1]));
    }

    if (request.method === "POST" && url.pathname === "/api/admin/listings/import") {
      return await handleAdminListingImport(request, response);
    }

    if (
      (request.method === "PATCH" || request.method === "POST") &&
      url.pathname === "/api/account/profile"
    ) {
      return await handleProfileUpdate(request, response);
    }

    if (request.method === "POST" && url.pathname === "/api/logout") {
      return handleLogout(request, response);
    }

    if (request.method === "POST" && url.pathname === "/api/bookings") {
      return await handleBookingCreate(request, response);
    }

    if (request.method === "POST" && url.pathname === "/api/orders") {
      return await handleOrderCreate(request, response);
    }

    if (request.method === "GET" && url.pathname === "/api/listings") {
      return handleListingIndex(response);
    }

    if (request.method === "POST" && url.pathname === "/api/listings") {
      return await handleListingCreate(request, response);
    }

    const listingMatch = url.pathname.match(/^\/api\/listings\/(\d+)$/);

    if (request.method === "PATCH" && listingMatch) {
      return await handleListingUpdate(request, response, Number(listingMatch[1]));
    }

    if (request.method === "POST" && url.pathname === "/api/listing-images") {
      return await handleListingImageUpload(request, response);
    }

    if (request.method === "POST" && url.pathname === "/api/exchanges") {
      return await handleExchangeCreate(request, response);
    }

    return sendJson(response, 404, { message: "Route introuvable." });
  } catch (error) {
    return sendJson(response, 500, {
      message: "Erreur serveur.",
      detail: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

seedDefaultUser();

server.listen(port, "127.0.0.1", () => {
  console.log(`Bisklet auth API running on http://127.0.0.1:${port}`);
});
