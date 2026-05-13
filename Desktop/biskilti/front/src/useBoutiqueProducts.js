import { useEffect, useMemo, useState } from "react";

import { apiRequest } from "./authClient.js";
import { boutiqueProducts } from "./boutiqueData.js";

const listingFallbackImage = "/gallery/bike-forest-rider.webp";

const categoryUseCases = {
  BMX: "Sport",
  Gravel: "Aventure",
  VTT: "Sport",
  "Velo electrique": "Ville",
  "Velo route": "Sport",
  "Velo urbain": "Ville",
};

function cleanText(value) {
  return String(value || "").trim();
}

function formatPrice(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Prix a discuter";
  }

  return `${new Intl.NumberFormat("fr-FR").format(amount)} DT`;
}

function discountedPrice(value, discountPercent) {
  const price = Number(value || 0);
  const discount = Number(discountPercent || 0);

  if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(discount) || discount <= 0) {
    return value;
  }

  return Math.max(0, Math.round(price * (1 - discount / 100)));
}

function listingDescription(listing) {
  const details = [
    cleanText(listing.description),
    cleanText(listing.condition) && `Etat: ${cleanText(listing.condition)}`,
    cleanText(listing.location) && `Localisation: ${cleanText(listing.location)}`,
  ].filter(Boolean);

  return details.join(" - ") || "Annonce publiee par un membre Bisklet.";
}

function listingTags(listing) {
  return [
    listing.brand,
    listing.model,
    listing.year,
    listing.size,
    listing.condition,
    listing.location,
  ]
    .map(cleanText)
    .filter(Boolean)
    .slice(0, 4);
}

function listingToProduct(listing) {
  const category = cleanText(listing.category) || "Annonce";
  const location = cleanText(listing.location);
  const condition = cleanText(listing.condition);
  const discountPercent = Number(listing.discount_percent || 0);
  const priceAfterDiscount = discountedPrice(listing.price, discountPercent);

  return {
    id: `listing-${listing.id}`,
    isListing: true,
    title: cleanText(listing.title) || "Annonce Bisklet",
    category,
    text: listingDescription(listing),
    image: cleanText(listing.image_url) || listingFallbackImage,
    price: formatPrice(priceAfterDiscount),
    oldPrice: discountPercent > 0 ? formatPrice(listing.price) : "",
    discount: discountPercent > 0 ? `-${discountPercent}%` : "Annonce",
    rating: "Annonce",
    reviews: condition || "Publiee",
    stock: location ? `Disponible a ${location}` : "Disponible",
    availability: "En stock",
    priceNumber: Number(listing.price || 0),
    useCase: categoryUseCases[category] || "Ville",
    badge: "Annonce",
    tags: listingTags(listing),
    cta: "Contacter le vendeur",
    createdAt: listing.created_at,
    sellerName: cleanText(listing.seller_name),
  };
}

export function useBoutiqueProducts() {
  const [listingProducts, setListingProducts] = useState([]);
  const [listingsStatus, setListingsStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    apiRequest("/api/listings")
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setListingProducts((data.listings || []).map(listingToProduct));
        setListingsStatus("ready");
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setListingProducts([]);
        setListingsStatus("error");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const products = useMemo(
    () => [...listingProducts, ...boutiqueProducts],
    [listingProducts],
  );

  return { listingProducts, listingsStatus, products };
}
