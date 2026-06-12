import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { Button, Card, Chip } from '../components/ui';
import { useApiResource } from '../hooks/useApiResource';
import { jachwiApi } from '../services/jachwiApi';
import { usePreferenceStore } from '../store/usePreferenceStore';
import { colors, radius, typography } from '../theme/theme';
import type { BudgetPeriod } from '../types/domain';

const REGION_OPTIONS = [
  { label: '부산 사상구', code: '26440' },
  { label: '부산 수영구', code: '26500' },
  { label: '부산 해운대구', code: '26350' },
  { label: '서울 마포구', code: '11440' },
  { label: '서울 관악구', code: '11620' },
  { label: '서울 송파구', code: '11710' },
  { label: '대전 서구', code: '30170' },
  { label: '대구 수성구', code: '27260' },
  { label: '광주 북구', code: '29170' },
  { label: '인천 부평구', code: '28237' },
  { label: '경기 수원시', code: '41110' },
  { label: '경기 고양시', code: '41280' },
  { label: '강원 춘천시', code: '42110' },
  { label: '제주 제주시', code: '50110' },
];
const KEYWORD_OPTIONS = ['계란', '쌀', '우유', '라면', '세제', '참치캔', '화장지', '대파'];
const BUDGET_PERIOD_OPTIONS: Array<{ label: string; value: BudgetPeriod }> = [
  { label: '주간', value: 'weekly' },
  { label: '월간', value: 'monthly' },
];

export function SetupScreen({ navigation }: any) {
  const storeRegion = usePreferenceStore((state) => state.region);
  const storeRegionCode = usePreferenceStore((state) => state.regionCode);
  const storeBudget = usePreferenceStore((state) => state.budget);
  const storeBudgetPeriod = usePreferenceStore((state) => state.budgetPeriod);
  const storeCategories = usePreferenceStore((state) => state.categories);
  const storeKeywords = usePreferenceStore((state) => state.keywords);
  const setPreferences = usePreferenceStore((state) => state.setPreferences);
  const categoryResource = useApiResource(() => jachwiApi.getCategories(), []);
  const userResource = useApiResource(() => jachwiApi.getUserMe(), []);
  const [regionLabel, setRegionLabel] = useState(storeRegion);
  const [regionCode, setRegionCode] = useState(storeRegionCode);
  const [budgetText, setBudgetText] = useState(String(storeBudget));
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod>(storeBudgetPeriod);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    storeCategories.filter((item) => !KEYWORD_OPTIONS.includes(item)),
  );
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(
    storeKeywords.length > 0 ? storeKeywords : storeCategories.filter((item) => KEYWORD_OPTIONS.includes(item)),
  );
  const [saving, setSaving] = useState(false);

  const budget = Number(budgetText.replace(/[^0-9]/g, ''));
  const categories = categoryResource.data?.categories ?? [];

  useEffect(() => {
    const preferences = userResource.data?.preferences;
    if (!preferences) return;

    const migratedKeywords = preferences.keywords ?? preferences.categories.filter((item) => KEYWORD_OPTIONS.includes(item));

    setRegionLabel(preferences.region);
    setRegionCode(preferences.regionCode);
    setBudgetText(String(preferences.budget));
    setBudgetPeriod(preferences.budgetPeriod ?? 'monthly');
    setSelectedCategories(preferences.categories.filter((item) => !KEYWORD_OPTIONS.includes(item)));
    setSelectedKeywords(migratedKeywords);
  }, [userResource.data]);

  const isValid = useMemo(
    () => regionLabel.trim().length > 0 && budget > 0 && (selectedCategories.length > 0 || selectedKeywords.length > 0),
    [regionLabel, budget, selectedCategories, selectedKeywords],
  );

  const handleRegionTextChange = (value: string) => {
    const matchedRegion = REGION_OPTIONS.find((option) => option.label === value.trim());
    setRegionLabel(value);
    setRegionCode(matchedRegion?.code ?? 'custom');
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category],
    );
  };

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword) ? prev.filter((item) => item !== keyword) : [...prev, keyword],
    );
  };

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('입력 확인', '지역, 예산, 관심 카테고리나 키워드를 입력해 주세요.');
      return;
    }

    const payload = {
      region: regionLabel.trim(),
      regionCode,
      budget,
      budgetPeriod,
      categories: selectedCategories,
      keywords: selectedKeywords,
    };

    try {
      setSaving(true);
      setPreferences(payload);
      await jachwiApi.savePreferences(payload);
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('설정 저장 실패', error instanceof Error ? error.message : '서버 요청에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout
      title="초기 설정"
      description="가격 조회와 추천에 사용할 조건을 먼저 정합니다."
      eyebrow="POST /users/preferences"
    >
      <Card>
        <Text style={styles.label}>생활 지역</Text>
        <TextInput
          value={regionLabel}
          onChangeText={handleRegionTextChange}
          placeholder="예: 부산 수영구, 서울 관악구"
          style={styles.input}
        />
        <Text style={styles.help}>직접 입력하거나 가까운 지역을 선택하세요.</Text>
        <View style={styles.wrap}>
          {REGION_OPTIONS.map((option) => (
            <Chip
              key={option.code}
              label={option.label}
              selected={regionCode === option.code}
              onPress={() => {
                setRegionLabel(option.label);
                setRegionCode(option.code);
              }}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.label}>장보기 예산 단위</Text>
        <View style={styles.wrap}>
          {BUDGET_PERIOD_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={budgetPeriod === option.value}
              onPress={() => setBudgetPeriod(option.value)}
            />
          ))}
        </View>
        <Text style={styles.label}>{budgetPeriod === 'weekly' ? '주간' : '월간'} 장보기 예산</Text>
        <TextInput
          value={budgetText}
          onChangeText={setBudgetText}
          placeholder="예: 320000"
          keyboardType="number-pad"
          style={styles.input}
        />
        <Text style={styles.help}>{budgetPeriod === 'weekly' ? '주간' : '월간'} 금액을 원화 정수로 저장합니다.</Text>
      </Card>

      <Card>
        <Text style={styles.label}>관심 카테고리</Text>
        <View style={styles.wrap}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              selected={selectedCategories.includes(category.name)}
              onPress={() => toggleCategory(category.name)}
            />
          ))}
        </View>
        {categoryResource.error ? <Text style={styles.help}>{categoryResource.error}</Text> : null}
      </Card>

      <Card>
        <Text style={styles.label}>관심 키워드</Text>
        <View style={styles.wrap}>
          {KEYWORD_OPTIONS.map((keyword) => (
            <Chip
              key={keyword}
              label={keyword}
              selected={selectedKeywords.includes(keyword)}
              onPress={() => toggleKeyword(keyword)}
            />
          ))}
        </View>
      </Card>
      <Button
        label={saving ? '저장 중' : '설정 완료'}
        testID="setup-submit-button"
        disabled={!isValid || saving}
        onPress={() => void handleSubmit()}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '800',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  input: {
    minHeight: 48,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    color: colors.primary,
    fontSize: typography.body,
  },
  help: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
});
