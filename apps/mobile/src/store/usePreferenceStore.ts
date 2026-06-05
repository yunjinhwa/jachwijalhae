import { create } from 'zustand';

type PreferenceState = {
  region: string;
  regionCode: string;
  budget: number;
  categories: string[];
  isSetupCompleted: boolean;
  setPreferences: (payload: {
    region: string;
    regionCode?: string;
    budget: number;
    categories: string[];
  }) => void;
};

export const usePreferenceStore = create<PreferenceState>((set) => ({
  region: '부산 사상구',
  regionCode: '26440',
  budget: 320000,
  categories: ['식품', '농산물', '생필품'],
  isSetupCompleted: false,

  setPreferences: ({ region, regionCode = '26440', budget, categories }) =>
    set({
      region,
      regionCode,
      budget,
      categories,
      isSetupCompleted: true,
    }),
}));
