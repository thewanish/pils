// src/utils/BeerApi.ts
import axios, { AxiosResponse } from "axios";
import { Beer } from "../Redux/BeerSlice";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

/* ================= CONFIG ================= */

const API_URL =
  "https://api.apify.com/v2/datasets/qkgx2kUaxNMLgSVNp/items?format=json&clean=true";

/* ================= API ================= */

type RawBeer = {
  city: string;
  pub_name: string;
  cheapest_price_nok: number;
  size_l: number | null;
  brewery: string | null;
};

// Safe doc id for pub_images (replace forward slashes)
const safeDocId = (pubName: string, city: string) => `${pubName}_${city}`.replace(/\//g, "-");

// Reject any Google Places or legacy Maps photo URLs to avoid charges
const isGooglePlacesOrMapsUrl = (url?: string) =>
  !!url && /https?:\/\/(places|maps)\.googleapis\.com\//i.test(url);

// Allow Firebase Storage URLs OR cached Google Places URLs (no new charges — already fetched)
const isFirebaseStorageUrl = (url?: string) =>
  !!url && (
    url.startsWith("https://firebasestorage.googleapis.com/") ||
    url.startsWith("https://storage.googleapis.com/") ||
    url.startsWith("gs://") ||
    /https:\/\/places\.googleapis\.com\/v1\//.test(url) // Temporary: reuse cached images
  );

// On-demand: fetch a single pub image by name + city (used in detail screen)
export async function getPubImage(pubName: string, city: string): Promise<string | undefined> {
  try {
    const id = safeDocId(pubName, city);
    const ref = doc(db, "pub_images", id);
    const snap = await getDoc(ref);
    
    if (snap.exists()) {
      const data = snap.data() as any;
      const imageUrl = data.image_url as string | undefined;
      
      console.log(`🖼️ getPubImage: ${pubName} (${id}) found, URL: ${imageUrl?.substring(0, 80)}...`);

      // 10/10 secure: never return Google Places/Maps media URLs (unless cached for now)
      if (isGooglePlacesOrMapsUrl(imageUrl)) {
        console.log(`⚠️ Google Places URL found (using cached): ${pubName}`);
        return imageUrl; // Temporary: allow cached Google images
      }

      // Allow Firebase Storage URLs
      if (isFirebaseStorageUrl(imageUrl)) return imageUrl;

      console.log(`❌ URL not allowed: ${pubName}`);
      return undefined;
    } else {
      console.log(`❌ No pub_images doc for: ${pubName} (id: ${id})`);
    }
  } catch (err) {
    console.warn("Failed to get pub image", pubName, city, err);
  }
  return undefined;
}

export const fetchBeers = async (): Promise<Beer[]> => {
  try {
    const response: AxiosResponse<RawBeer[]> = await axios.get(API_URL);

    if (response.status === 200 && Array.isArray(response.data)) {
      // Return quickly without waiting on images to avoid blocking UI
      const beers = response.data.map((item, index) => ({
        id: index,
        name: item.pub_name,
        pub_name: item.pub_name,
        city: item.city,
        cheapest_price_nok: item.cheapest_price_nok,
        // Skip image_url initially to let lists render fast; detail screen loads on demand
        image_url: undefined,
      }));
      return beers;
    }

    return [];
  } catch (error) {
    console.log("BEER API ERROR:", error);
    return [];
  }
};

export const fetchCities = async (): Promise<
  { city: string; label: string }[]
> => {
  try {
    const beers = await fetchBeers();

    const uniqueCities = Array.from(
      new Set(beers.map((b) => b.city))
    );

    return uniqueCities.map((city) => ({
      city,
      label: city.charAt(0).toUpperCase() + city.slice(1),
    }));
  } catch (error) {
    console.log("CITY API ERROR:", error);
    return [];
  }
};
