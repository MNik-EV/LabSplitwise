import { create } from "zustand";

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));

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
