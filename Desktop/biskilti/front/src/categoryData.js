import catBikesImage from "./assets/cat-bikes.svg";
import catPartsImage from "./assets/cat-parts.svg";
import catAccessoriesImage from "./assets/cat-accessories.svg";
import catAdsImage from "./assets/cat-ads.svg";

export const categories = {
  velos: {
    kicker: "Categorie Velos & VAE",
    title: "Velos & VAE",
    text: "VTT, velos de ville, electriques et modeles premium.",
    image: catBikesImage,
    points: [
      "Modeles adaptes aux trajets urbains et aux balades.",
      "Velos electriques pour plus de confort et d'autonomie.",
      "Options premium pour les utilisateurs exigeants.",
    ],
  },
  pieces: {
    kicker: "Categorie Pieces de rechange",
    title: "Pieces de rechange",
    text: "Transmission, freins, pneus, batteries et consommables.",
    image: catPartsImage,
    points: [
      "Pieces essentielles pour reparer et entretenir votre velo.",
      "Freins, pneus, batteries et consommables utiles au quotidien.",
      "Presentation claire pour identifier rapidement le bon besoin.",
    ],
  },
  accessoires: {
    kicker: "Categorie Accessoires",
    title: "Accessoires",
    text: "Casques, antivols, sacoches, eclairage et equipement.",
    image: catAccessoriesImage,
    points: [
      "Equipements pour rouler avec plus de confort.",
      "Accessoires de securite pour les trajets en ville.",
      "Solutions pratiques pour transporter, proteger et eclairer.",
    ],
  },
  annonces: {
    kicker: "Categorie Petites annonces",
    title: "Petites annonces",
    text: "Tous types d'annonces velo et mobilite douce.",
    image: catAdsImage,
    points: [
      "Annonces pour acheter, vendre ou echanger simplement.",
      "Informations claires pour comparer les opportunites.",
      "Un espace dedie a la mobilite douce locale.",
    ],
  },
};
