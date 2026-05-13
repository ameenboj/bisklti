import "./App.css";

import { useState } from "react";
import { apiRequest, storeAuthSession } from "./authClient.js";

const authBenefits = [
  "Reservations, commandes et annonces au meme endroit.",
  "Favoris sauvegardes pour comparer plus vite.",
  "Contact boutique direct avec vos informations pre-remplies.",
];

function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirmation: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const title = isRegister ? "Creer votre compte Bisklet" : "Bienvenue sur Bisklet";
  const text = isRegister
    ? "Inscrivez-vous pour reserver, acheter, vendre et suivre votre activite velo dans un espace clair."
    : "Connectez-vous pour retrouver votre profil, vos favoris, vos commandes et vos demandes boutique.";

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (isRegister && form.password !== form.passwordConfirmation) {
      setStatus({
        type: "error",
        message: "Les mots de passe ne sont pas identiques.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = isRegister
        ? {
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
          }
        : {
            email: form.email,
            password: form.password,
          };
      const data = await apiRequest(isRegister ? "/api/register" : "/api/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      storeAuthSession(data);
      setStatus({ type: "success", message: data.message });
      window.location.href = "/my-account.html";
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="site-shell auth-shell">
      <header className="detail-topbar auth-topbar">
        <a className="brand" href="/accueil.html" aria-label="Bisklet accueil">
          <span className="brand-logo">B</span>
          <span className="brand-name">Bisklet</span>
        </a>
        <nav className="topnav" aria-label="Navigation authentification">
          <a href="/accueil.html">ACCUEIL</a>
          <a href="/location.html">LOCATION</a>
          <a href="/boutique.html">BOUTIQUE</a>
        </nav>
        <div className="top-actions auth-nav-actions">
          <a className="login-link" href="/login.html">
            Login
          </a>
          <a className="register-link" href="/register.html">
            Register
          </a>
        </div>
      </header>

      <section className="auth-layout">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-head">
            <span>{isRegister ? "Nouveau compte" : "Acces compte"}</span>
            <h1>{isRegister ? "Register" : "Login"}</h1>
            <p>
              {isRegister
                ? "Creez un compte pour acheter, reserver et gerer vos annonces Bisklet."
                : "Connectez-vous pour retrouver vos favoris, commandes et demandes boutique."}
            </p>
          </div>

          {isRegister && (
            <label className="auth-field">
              <span>Nom complet</span>
              <input
                type="text"
                placeholder="Mohamed Amine"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                required
              />
            </label>
          )}

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="amine@email.com"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
            />
          </label>

          {isRegister && (
            <label className="auth-field">
              <span>Telephone</span>
              <input
                type="tel"
                placeholder="+216 99 000 000"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </label>
          )}

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Votre mot de passe"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              minLength={4}
              required
            />
          </label>

          {isRegister && (
            <label className="auth-field">
              <span>Confirmer password</span>
              <input
                type="password"
                placeholder="Repeter le mot de passe"
                value={form.passwordConfirmation}
                onChange={(event) =>
                  updateField("passwordConfirmation", event.target.value)
                }
                minLength={4}
                required
              />
            </label>
          )}

          {!isRegister && (
            <div className="auth-row">
              <label>
                <input type="checkbox" />
                <span>Se souvenir de moi</span>
              </label>
              <a href="/register.html">Mot de passe oublie ?</a>
            </div>
          )}

          {status.message && (
            <div className={`auth-message ${status.type}`}>{status.message}</div>
          )}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Veuillez patienter..."
              : isRegister
                ? "Creer mon compte"
                : "Se connecter"}
          </button>

          <p className="auth-switch">
            {isRegister ? "Vous avez deja un compte ?" : "Pas encore de compte ?"}
            <a href={isRegister ? "/login.html" : "/register.html"}>
              {isRegister ? " Login" : " Register"}
            </a>
          </p>
        </form>

        <div className="auth-visual-panel">
          <span className="section-kicker">Compte Bisklet</span>
          <h1>{title}</h1>
          <p>{text}</p>
          <div className="auth-benefit-list">
            {authBenefits.map((benefit) => (
              <div className="auth-benefit" key={benefit}>
                <span aria-hidden="true">OK</span>
                <p>{benefit}</p>
              </div>
            ))}
          </div>
          <div className="auth-mini-stats" aria-label="Avantages compte">
            <div>
              <strong>24/7</strong>
              <span>acces compte</span>
            </div>
            <div>
              <strong>DT</strong>
              <span>prix suivis</span>
            </div>
            <div>
              <strong>Pro</strong>
              <span>profil clair</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
