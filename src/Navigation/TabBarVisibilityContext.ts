import { createContext } from "react";

export const TabBarVisibilityContext = createContext<{
  hideTabBar: () => void;
  showTabBar: () => void;
}>({
  hideTabBar: () => {},
  showTabBar: () => {},
});
