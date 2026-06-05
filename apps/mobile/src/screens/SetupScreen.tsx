import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { Button, Card, Chip, DataNotice } from '../components/ui';
import { categories as fallbackCategories } from '../data/mockData';
import { useApiResource } from '../hooks/useApiResource';
import { jachwiApi } from '../services/jachwiApi';
import { usePreferenceStore } from '../store/usePreferenceStore';
import { colors, radius, typography } from '../theme/theme';

const REGION_OPTIONS = [
  { label: '부산 사상구', code: '26440' },
  { label: '서울 마포구', code: '11440' },
  { label: '대전 서구', code: '30170' },
];
const KEYWORD_OPTIONS = ['계란', '쌀', '우유', '라면', '세제', '참치캔', '화장지', '대파'];

export function SetupScreen({ navigation }: any) {
  const storeRegion = usePreferenceStore((state) => state.region);
  const storeRegionCode = usePreferenceStore((state) => state.regionCode);
  const storeBudget = usePreferenceStore((state) => state.budget);
  const storeCategories = usePreferenceStore((state) => state.categories);
  const setPreferences = usePreferenceStore((state) => state.setPreferences);
  const categoryResource = useApiResource(() => jachwiApi.getCategories(), []);
  const userResource = useApiResource(() => jachwiApi.getUserMe(), []);
  const [region, setRegion] = useState(
    REGION_OPTIONS.find((option) => option.code === storeRegionCode) ?? {
      label: storeRegion,
      code: storeRegionCode,
    },
  );
  const [budgetText, setBudgetText] = useState(String(storeBudget));
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    storeCategories.filter((item) => !KEYWORD_OPTIONS.includes(item)),
  );
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(
    storeCategories.filter((item) => KEYWORD_OPTIONS.includes(item)),
  );
  const [saving, setSaving] = useState(false);

  const budget = Number(budgetText.replace(/[^0-9]/g, ''));
  const categories = categoryResource.data?.categories ?? fallbackCategories;

  useEffect(() => {
    const preferences = userResource.data?.preferences;
    if (!preferences) return;

    setRegion(
      REGION_OPTIONS.find((option) => option.code === preferences.regionCode) ?? {
        label: preferences.region,
        code: preferences.regionCode,
      },
    );
    setBudgetText(String(preferences.budget));
    setSelectedCategories(preferences.categories.filter((item) => !KEYWORD_OPTIONS.includes(item)));
    setSelectedKeywords(preferences.categories.filter((item) => KEYWORD_OPTIONS.includes(item)));
  }, [userResource.data]);

  const isValid = useMemo(
    () => region.label.length > 0 && budget > 0 && (selectedCategories.length > 0 || selectedKeywords.length > 0),
    [region, budget, selectedCategories, selectedKeywords],
  );

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
      Alert.alert('입력 확인', '지역, 예산, 관심 카테고리를 모두 입력해 주세요.');
      return;
    }

    const payload = {
      region: region.label,
      regionCode: region.code,
      budget,
      categories: [...selectedCategories, ...selectedKeywords],
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
      description="가격 조회와 추천에 사용할 기준을 먼저 정합니다."
      eyebrow="POST /users/preferences"
    >
      <Card>
        <Text style={styles.label}>기준 지역</Text>
        <View style={styles.wrap}>
          {REGION_OPTIONS.map((option) => (
            <Chip
              key={option.code}
              label={option.label}
              selected={region.code === option.code}
              onPress={() => setRegion(option)}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.label}>월 장보기 예산</Text>
        <TextInput
          value={budgetText}
          onChangeText={setBudgetText}
          placeholder="예: 320000"
          keyboardType="number-pad"
          style={styles.input}
        />
        <Text style={styles.help}>원화 정수만 저장합니다.</Text>
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

      <DataNotice source="지역/예산/관심 카테고리만 저장합니다." />
      <Button
        label={saving ? '저장 중' : '설정 완료'}
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
