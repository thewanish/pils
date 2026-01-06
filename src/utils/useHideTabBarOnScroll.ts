import { useEffect, useMemo, useRef, useContext } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { TabBarVisibilityContext } from "../Navigation/MainTabs";

/**
 * Hide the bottom tab bar when the user scrolls down, show it again on scroll up.
 */
export const useHideTabBarOnScroll = (threshold: number = 12) => {
  const lastOffset = useRef(0);
  const isHidden = useRef(false);
  const { hideTabBar, showTabBar } = useContext(TabBarVisibilityContext);

  const hide = () => {
    if (isHidden.current) return;
    isHidden.current = true;
    hideTabBar();
  };

  const show = () => {
    if (!isHidden.current) return;
    isHidden.current = false;
    showTabBar();
  };

  const onScroll = useMemo(
    () => (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      const delta = y - lastOffset.current;
      
      lastOffset.current = y;

      if (delta > 5 && y > 50) {
        hide();
      } else if (delta < -5) {
        show();
      }
    },
    [threshold]
  );

  useEffect(() => {
    return () => {
      show();
    };
  }, []);

  const onTouchStart = () => {
    if (isHidden.current) {
      show();
    }
  };

  return { onScroll, scrollEventThrottle: 16, onTouchStart } as const;
};
