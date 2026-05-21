import { create } from 'zustand';

type PreferenceState = {
  region: string;
  budget: number;
  categories: string[];
  isSetupCompleted: boolean;
  setPreferences: (payload: {
    region: string;
    budget: number;
    categories: string[];
  }) => void;
};

export const usePreferenceStore = create<PreferenceState>((set) => ({
  region: '',
  budget: 0,
  categories: [],
  isSetupCompleted: false,

  setPreferences: ({ region, budget, categories }) =>
    set({
      region,
      budget,
      categories,
      isSetupCompleted: true,
    }),
}));