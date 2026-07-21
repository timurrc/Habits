import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  focusMode: boolean;
  toggleFocusMode: () => void;
  setFocusMode: (value: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      focusMode: true,
      toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
      setFocusMode: (value) => set({ focusMode: value }),
    }),
    { name: "goodday-ui" }
  )
);
