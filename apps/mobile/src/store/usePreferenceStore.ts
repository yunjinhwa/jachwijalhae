import { create } from 'zustand';
import type { BudgetPeriod } from '../types/domain';

type PreferenceState = {
  region: string;
  regionCode: string;
  budget: number;
  budgetPeriod: BudgetPeriod;
  categories: string[];
  keywords: string[];
  isSetupCompleted: boolean;
  setPreferences: (payload: {
    region: string;
    regionCode?: string;
    budget: number;
    budgetPeriod?: BudgetPeriod;
    categories: string[];
    keywords?: string[];
  }) => void;
  setBudgetPeriod: (budgetPeriod: BudgetPeriod) => void;
  resetPreferences: () => void;
};

const defaultPreferences = {
  region: '부산 사상구',
  regionCode: '26440',
  budget: 320000,
  budgetPeriod: 'monthly' as BudgetPeriod,
  categories: ['농산물', '축산물', '생활용품'],
  keywords: ['계란', '쌀', '라면'],
};

export const usePreferenceStore = create<PreferenceState>((set) => ({
  ...defaultPreferences,
  isSetupCompleted: false,

  setPreferences: ({ region, regionCode = '26440', budget, budgetPeriod, categories, keywords = [] }) =>
    set((state) => ({
      region,
      regionCode,
      budget,
      budgetPeriod: budgetPeriod ?? state.budgetPeriod,
      categories,
      keywords,
      isSetupCompleted: true,
    })),

  setBudgetPeriod: (budgetPeriod) => set({ budgetPeriod }),

  resetPreferences: () =>
    set({
      ...defaultPreferences,
      isSetupCompleted: false,
    }),
}));
