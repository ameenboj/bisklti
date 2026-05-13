const desertBikeImage = "/gallery/ebike-desert-rider.jpg";
const lakeBikeImage = "/gallery/ebike-lake-sunset.jpg";
const motorImage = "/gallery/ebike-motor-repair.jpg";
const forestBikeImage = "/gallery/bike-forest-rider.webp";

import catAccessoriesImage from "./assets/cat-accessories.svg";
import featSecureImage from "./assets/feat-secure.svg";
import featLocalImage from "./assets/feat-local.svg";

export const boutiqueProducts = [
  {
    title: "E-Bike Fat Tire Explorer",
    category: "Velo electrique",
    text: "Velo electrique tout chemin avec pneus larges, position confortable et autonomie ideale pour les sorties longues.",
    image: desertBikeImage,
    price: "3 490 DT",
    oldPrice: "3 990 DT",
    discount: "-13%",
    rating: "4.8/5",
    reviews: "34 avis",
    stock: "En stock",
    tags: ["Autonomie 70 km", "Freins disque", "Pneus fat"],
  },
  {
    title: "City E-Bike Sunset",
    category: "Velo urbain",
    text: "Velo urbain electrique pour les trajets quotidiens, les balades au lac et les deplacements sans effort.",
    image: lakeBikeImage,
    price: "2 650 DT",
    oldPrice: "2 950 DT",
    discount: "-10%",
    rating: "4.7/5",
    reviews: "28 avis",
    stock: "Livraison 48h",
    tags: ["Ville", "Confort", "Assistance"],
  },
  {
    title: "Mountain Bike Sport",
    category: "VTT",
    text: "VTT robuste pour les circuits, pistes et sorties sportives avec une conduite stable et precise.",
    image: forestBikeImage,
    price: "1 890 DT",
    oldPrice: "2 190 DT",
    discount: "-14%",
    rating: "4.6/5",
    reviews: "41 avis",
    stock: "Disponible",
    tags: ["Sport", "Suspension", "Performance"],
  },
  {
    title: "Kit moteur E-Bike",
    category: "Pieces & entretien",
    text: "Controle moteur, diagnostic, protection et pieces utiles pour garder votre velo electrique fiable.",
    image: motorImage,
    price: "690 DT",
    oldPrice: "790 DT",
    discount: "-13%",
    rating: "4.9/5",
    reviews: "19 avis",
    stock: "Stock limite",
    tags: ["Moteur", "Entretien", "E-Bike"],
  },
];

export const boutiqueHighlights = [
  {
    title: "Caracteristiques exceptionnelles",
    text: "Des equipements choisis pour une experience de conduite optimale : autonomie, resistance et securite.",
    image: featSecureImage,
  },
  {
    title: "Facilite d'utilisation",
    text: "Reservation simple, choix rapide et recuperation pratique selon le besoin du client.",
    image: catAccessoriesImage,
  },
  {
    title: "Mobilite urbaine sans effort",
    text: "Evitez les embouteillages, gagnez du temps et explorez votre ville de maniere plus propre.",
    image: featLocalImage,
  },
];

export const buyingGuide = [
  {
    title: "Pour les trajets courts",
    text: "La trottinette electrique est ideale pour gagner du temps en ville et eviter les embouteillages.",
  },
  {
    title: "Pour rouler tous les jours",
    text: "Le city bike convient aux deplacements quotidiens, aux balades simples et aux parcours urbains.",
  },
  {
    title: "Pour les sorties sportives",
    text: "Le mountain bike apporte plus de stabilite, de resistance et de confort pour les circuits.",
  },
  {
    title: "Pour mieux equiper votre velo",
    text: "Les pieces et accessoires ameliorent la securite, l'entretien et l'experience de conduite.",
  },
];
