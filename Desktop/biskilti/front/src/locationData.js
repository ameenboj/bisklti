import catBikesImage from "./assets/cat-bikes.svg";
import catPartsImage from "./assets/cat-parts.svg";
import catAccessoriesImage from "./assets/cat-accessories.svg";
import featFastImage from "./assets/feat-fast.svg";
import featLocalImage from "./assets/feat-local.svg";
import featSecureImage from "./assets/feat-secure.svg";
import txBuyImage from "./assets/tx-buy.svg";
import txExchangeImage from "./assets/tx-exchange.svg";

export const rentalItems = [
  {
    title: "Trottinette electrique",
    image: featFastImage,
    details: ["Base Rate: $4.30", "Per Mile/KM: $2.00", "Passengers: 4"],
    text: "Une solution moderne pour naviguer en ville avec style, confort et moins d'empreinte carbone.",
  },
  {
    title: "Trottinette classique",
    image: catAccessoriesImage,
    details: ["Base Rate: $4.30", "Per Mile/KM: $2.00", "Passengers: 4"],
    text: "Pratique pour les petits trajets, les balades courtes et les deplacements rapides.",
  },
  {
    title: "City Bike",
    image: catBikesImage,
    details: ["Base Rate: $4.30", "Per Mile/KM: $2.00", "Passengers: 4"],
    text: "Un velo confortable pour les trajets urbains et les sorties tranquilles.",
  },
  {
    title: "Mountain Bike",
    image: catPartsImage,
    details: ["Base Rate: $4.30", "Per Mile/KM: $2.00", "Passengers: 4"],
    text: "Une option robuste pour les parcours dynamiques, les circuits et les sorties sportives.",
  },
];

export const benefits = [
  {
    title: "Simple booking",
    text: "Choisissez votre velo ou trottinette, puis bookez rapidement votre service.",
    image: txBuyImage,
  },
  {
    title: "Meilleur prix",
    text: "Des formules claires pour profiter d'une mobilite accessible et pratique.",
    image: featSecureImage,
  },
  {
    title: "Livraison & collecte",
    text: "Un service a domicile pour simplifier la prise en charge et la restitution.",
    image: txExchangeImage,
  },
  {
    title: "Visites guidees",
    text: "Des balades accompagnees pour decouvrir la ville autrement.",
    image: featLocalImage,
  },
];

export const locationSteps = [
  "Inscrivez-vous sur notre site web.",
  "Localisez le point de location le plus proche.",
  "Choisissez votre Bisklet et confirmez votre booking.",
  "Profitez de votre trajet et restituez le vehicule au point designe.",
];
