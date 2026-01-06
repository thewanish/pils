import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* ================= TYPES ================= */

export type Beer = {
  id: number;
  name: string;
  pub_name: string;
  city: string;
  cheapest_price_nok: number;
  image_url?: string;
};

export type CityOption = {
  city: string;
  label: string;
};

export interface BeerState {
  beers: Beer[];
  filteredBeers: Beer[];
  savedBeers: Beer[];
  cities: CityOption[];
  selectedCity: string | null;
  isNotificationSubscribed: boolean;
  userOnboarded: boolean;
}

/* ================= STATE ================= */

const initialState: BeerState = {
  beers: [],
  filteredBeers: [],
  savedBeers: [],
  cities: [],
  selectedCity: null,
  isNotificationSubscribed: false,
  userOnboarded: false,
};

/* ================= SLICE ================= */

const beerSlice = createSlice({
  name: "beer",
  initialState,
  reducers: {
    setBeers(state, action: PayloadAction<Beer[]>) {
      state.beers = action.payload;
      state.filteredBeers = action.payload;
    },

    filterBeersByCity(state, action: PayloadAction<string | null>) {
      state.selectedCity = action.payload;
      if (!action.payload) {
        state.filteredBeers = state.beers;
      } else {
        state.filteredBeers = state.beers.filter(
          (b) => b.city === action.payload
        );
      }
    },

    toggleSaveBeer(state, action: PayloadAction<Beer>) {
      const exists = state.savedBeers.find(
        (b) => b.id === action.payload.id
      );

      if (exists) {
        state.savedBeers = state.savedBeers.filter(
          (b) => b.id !== action.payload.id
        );
      } else {
        state.savedBeers.push(action.payload);
      }
    },

    setCities(state, action: PayloadAction<CityOption[]>) {
      state.cities = action.payload;
    },

    setSelectedCity(state, action: PayloadAction<string>) {
      state.selectedCity = action.payload;
    },

    setIsNotificationSubscribed(state, action: PayloadAction<boolean>) {
      state.isNotificationSubscribed = action.payload;
    },

    setUserOnboard(state, action: PayloadAction<boolean>) {
      state.userOnboarded = action.payload;
    },
  },
});

export const {
  setBeers,
  filterBeersByCity,
  toggleSaveBeer,
  setCities,
  setSelectedCity,
  setIsNotificationSubscribed,
  setUserOnboard,
} = beerSlice.actions;

export default beerSlice.reducer;
