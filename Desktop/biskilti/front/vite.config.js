import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        accueil: resolve(__dirname, "accueil.html"),
        location: resolve(__dirname, "location.html"),
        boutique: resolve(__dirname, "boutique.html"),
        messagerie: resolve(__dirname, "messagerie.html"),
        myAccount: resolve(__dirname, "my-account.html"),
        adminDashboard: resolve(__dirname, "admin-dashboard.html"),
        login: resolve(__dirname, "login.html"),
        register: resolve(__dirname, "register.html"),
        boutiqueProduits: resolve(__dirname, "boutique-produits.html"),
        boutiqueGuide: resolve(__dirname, "boutique-guide.html"),
        locationOffres: resolve(__dirname, "location-offres.html"),
        locationHow: resolve(__dirname, "location-comment-ca-marche.html"),
        vendre: resolve(__dirname, "vendre.html"),
        explorer: resolve(__dirname, "explorer.html"),
        echange: resolve(__dirname, "echange.html"),
        categorieVelos: resolve(__dirname, "categorie-velos.html"),
        categoriePieces: resolve(__dirname, "categorie-pieces.html"),
        categorieAccessoires: resolve(__dirname, "categorie-accessoires.html"),
        categorieAnnonces: resolve(__dirname, "categorie-annonces.html"),
      },
    },
  },
});
