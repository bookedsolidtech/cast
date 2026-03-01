import { create } from 'zustand';

interface DemoModeState {
  demoMode: boolean;
  setDemoMode: (value: boolean) => void;
}

export const useDemoModeStore = create<DemoModeState>((set) => ({
  demoMode: false,
  setDemoMode: (value) => set({ demoMode: value }),
}));

/** Returns true when the server is running in demo mode. */
export function useDemoMode(): boolean {
  return useDemoModeStore((s) => s.demoMode);
}
