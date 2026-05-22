import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/theme';

const CATEGORIES = ['전체', '식품', '생활용품', '농산물', '축산물', '수산물'];

const RECENT_KEYWORDS = ['계란', '라면', '즉석밥', '휴지'];
const POPULAR_KEYWORDS = ['쌀', '우유', '대파', '두부', '돼지고기'];

const MOCK_ITEMS = [
  {
    id: 'egg-30',
    name: '계란 30구',
    category: '축산물',
    avgPrice: 6200,
    keywords: ['계란', '달걀', '알', 'egg'],
  },
  {
    id: 'egg-15',
    name: '특란 15구',
    category: '축산물',
    avgPrice: 3300,
    keywords: ['계란', '달걀', '특란', '알', 'egg'],
  },
  {
    id: 'rice-10',
    name: '쌀 10kg',
    category: '식품',
    avgPrice: 28900,
    keywords: ['쌀', '백미', 'rice'],
  },
  {
    id: 'milk-1',
    name: '우유 1L',
    category: '식품',
    avgPrice: 2450,
    keywords: ['우유', 'milk'],
  },
  {
    id: 'ramen',
    name: '라면 5개입',
    category: '식품',
    avgPrice: 4200,
    keywords: ['라면', '라멘', 'ramen'],
  },
  {
    id: 'tissue',
    name: '화장지 30롤',
    category: '생활용품',
    avgPrice: 15900,
    keywords: ['화장지', '휴지', '롤휴지', 'tissue'],
  },
  {
    id: 'tofu',
    name: '두부 300g',
    category: '식품',
    avgPrice: 1300,
    keywords: ['두부', 'tofu'],
  },
  {
    id: 'green-onion',
    name: '대파 1단',
    category: '농산물',
    avgPrice: 2800,
    keywords: ['대파', '파', '쪽파', 'green onion'],
  },
];

export function SearchScreen() {
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const trimmedKeyword = keyword.trim();

  const filteredItems = useMemo(() => {
    if (!trimmedKeyword) {
      return [];
    }

    return MOCK_ITEMS.filter((item) => {
        const normalizedKeyword = trimmedKeyword.toLowerCase();

        const matchesKeyword =
        item.name.toLowerCase().includes(normalizedKeyword) ||
        item.keywords.some((keyword) =>
            keyword.toLowerCase().includes(normalizedKeyword),
        );
        const matchesCategory =
            selectedCategory === '전체' || item.category === selectedCategory;

      return matchesKeyword && matchesCategory;
    });
  }, [trimmedKeyword, selectedCategory]);

  const hasKeyword = trimmedKeyword.length > 0;
  const isEmpty = hasKeyword && filteredItems.length === 0;

  const handleKeywordPress = (nextKeyword: string) => {
    setKeyword(nextKeyword);
  };

  return (
    <ScreenLayout title="품목 검색" description="오늘 살 품목의 가격을 찾아보세요.">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="예: 계란, 라면, 세제"
            style={styles.searchInput}
            returnKeyType="search"
          />
          {keyword.length > 0 ? (
            <Pressable onPress={() => setKeyword('')}>
              <Text style={styles.clearText}>삭제</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.categoryWrap}>
          {CATEGORIES.map((category) => {
            const selected = category === selectedCategory;

            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[styles.categoryChip, selected && styles.categoryChipSelected]}
              >
                <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!hasKeyword ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>최근 검색어</Text>
              <View style={styles.keywordList}>
                {RECENT_KEYWORDS.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => handleKeywordPress(item)}
                    style={styles.keywordItem}
                  >
                    <Text style={styles.keywordText}>{item}</Text>
                    <Text style={styles.keywordDelete}>삭제</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>많이 찾는 품목</Text>
              <View style={styles.popularWrap}>
                {POPULAR_KEYWORDS.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => handleKeywordPress(item)}
                    style={styles.popularChip}
                  >
                    <Text style={styles.popularText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        ) : null}

        {hasKeyword && !isEmpty ? (
          <View style={styles.section}>
            <View style={styles.resultHeader}>
              <Text style={styles.sectionTitle}>검색 결과</Text>
              <Text style={styles.resultCount}>{filteredItems.length}개</Text>
            </View>

            {filteredItems.map((item) => (
              <Pressable key={item.id} style={styles.resultItem}>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{item.category}</Text>
                </View>

                <View style={styles.resultSide}>
                  <Text style={styles.itemPrice}>{item.avgPrice.toLocaleString()}원</Text>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}

        {isEmpty ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>검색 결과가 없습니다</Text>
            <Text style={styles.emptyDescription}>
              검색어를 확인하거나 다른 품목을 검색해 주세요.
            </Text>

            <View style={styles.recommendBox}>
              <Text style={styles.recommendTitle}>추천 검색어</Text>
              <View style={styles.popularWrap}>
                {POPULAR_KEYWORDS.slice(0, 3).map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => handleKeywordPress(item)}
                    style={styles.popularChip}
                  >
                    <Text style={styles.popularText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 18,
    color: colors.textMuted,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.primary,
  },
  clearText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
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
    fontSize: 13,
    color: colors.primary,
  },
  categoryTextSelected: {
    color: colors.background,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  keywordList: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
  },
  keywordItem: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keywordText: {
    fontSize: 15,
    color: colors.primary,
  },
  keywordDelete: {
    fontSize: 12,
    color: colors.textMuted,
  },
  popularWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  popularText: {
    fontSize: 14,
    color: colors.primary,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
  resultItem: {
    minHeight: 64,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  resultSide: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  arrow: {
    fontSize: 22,
    color: colors.textMuted,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  recommendBox: {
    width: '100%',
  },
  recommendTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 10,
  },
});