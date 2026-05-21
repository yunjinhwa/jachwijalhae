import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/theme';
import { usePreferenceStore } from '../store/usePreferenceStore';

const CATEGORY_OPTIONS = ['식품', '축산물', '생활용품', '농산물', '수산물', '개인위생'];

export function SetupScreen({ navigation }: any) {
  const setPreferences = usePreferenceStore((state) => state.setPreferences);

  const [region, setRegion] = useState('');
  const [budgetText, setBudgetText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const budget = Number(budgetText.replace(/[^0-9]/g, ''));

  const isValid = useMemo(() => {
    return region.trim().length > 0 && budget > 0 && selectedCategories.length > 0;
  }, [region, budget, selectedCategories]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category);
      }

      return [...prev, category];
    });
  };

  const handleSubmit = () => {
    if (!isValid) {
      Alert.alert('입력 확인', '지역, 예산, 관심 카테고리를 모두 입력해 주세요.');
      return;
    }

    setPreferences({
      region: region.trim(),
      budget,
      categories: selectedCategories,
    });

    navigation.replace('MainTabs');
  };

  return (
    <ScreenLayout title="초기 설정" description="거주 지역과 예산을 설정해 주세요.">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <Text style={styles.label}>거주 지역</Text>
          <TextInput
            value={region}
            onChangeText={setRegion}
            placeholder="예: 부산 사상구"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>월 장보기 예산</Text>
          <TextInput
            value={budgetText}
            onChangeText={setBudgetText}
            placeholder="예: 300000"
            keyboardType="number-pad"
            style={styles.input}
          />
          <Text style={styles.helperText}>
            {budget > 0 ? `입력 예산: ${budget.toLocaleString()}원` : '숫자만 입력해 주세요.'}
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>관심 카테고리</Text>
          <View style={styles.categoryWrap}>
            {CATEGORY_OPTIONS.map((category) => {
              const selected = selectedCategories.includes(category);

              return (
                <Pressable
                  key={category}
                  onPress={() => toggleCategory(category)}
                  style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                >
                  <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={!isValid}
          style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
        >
          <Text style={styles.submitButtonText}>설정 완료</Text>
        </Pressable>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontSize: 15,
    color: colors.primary,
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textMuted,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: colors.primary,
  },
  categoryTextSelected: {
    color: colors.background,
    fontWeight: '700',
  },
  submitButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.35,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
});