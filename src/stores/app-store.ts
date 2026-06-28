import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: "lab-splitwise-app" },
  ),
);

interface OrderFormState {
  step: number;
  setStep: (step: number) => void;
  reset: () => void;
}

export const useOrderFormStore = create<OrderFormState>()((set) => ({
  step: 1,
  setStep: (step) => set({ step }),
  reset: () => set({ step: 1 }),
}));
