import { create } from 'zustand';
import type { BudgetPeriod } from '../types/domain';

type PreferenceState = {
  region: string;
  regionCode: string;
  budget: number;
  budgetPeriod: BudgetPeriod;
  categories: string[];
  isSetupCompleted: boolean;
  setPreferences: (payload: {
    region: string;
    regionCode?: string;
    budget: number;
    budgetPeriod?: BudgetPeriod;
    categories: string[];
  }) => void;
  setBudgetPeriod: (budgetPeriod: BudgetPeriod) => void;
  resetPreferences: () => void;
};

const defaultPreferences = {
  region: '부산 사상구',
  regionCode: '26440',
  budget: 320000,
  budgetPeriod: 'monthly' as BudgetPeriod,
  categories: ['식품', '농산물', '생필품'],
};

export const usePreferenceStore = create<PreferenceState>((set) => ({
  ...defaultPreferences,
  isSetupCompleted: false,

  setPreferences: ({ region, regionCode = '26440', budget, budgetPeriod, categories }) =>
    set((state) => ({
      region,
      regionCode,
      budget,
      budgetPeriod: budgetPeriod ?? state.budgetPeriod,
      categories,
      isSetupCompleted: true,
    })),

  setBudgetPeriod: (budgetPeriod) => set({ budgetPeriod }),

  resetPreferences: () =>
    set({
      ...defaultPreferences,
      isSetupCompleted: false,
    }),
}));
