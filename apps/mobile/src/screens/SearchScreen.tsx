import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { Button, Card, Chip, EmptyState, PriceRow, SectionTitle } from '../components/ui';
import { useApiResource } from '../hooks/useApiResource';
import { jachwiApi } from '../services/jachwiApi';
import { colors, radius, typography } from '../theme/theme';

const RECENT_KEYWORDS = ['계란', '라면', '화장지', '우유'];
const POPULAR_KEYWORDS = ['쌀', '대파', '세탁세제', '참치캔', '우유'];

export function SearchScreen({ navigation }: any) {
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const trimmedKeyword = keyword.trim().toLowerCase();
  const categoryResource = useApiResource(() => jachwiApi.getCategories(), []);
  const resultResource = useApiResource(
    () =>
      trimmedKeyword
        ? jachwiApi.searchItems({ q: trimmedKeyword, categoryId: selectedCategory })
        : Promise.resolve({
            keyword: '',
            items: [],
            pagination: { page: 1, size: 20, total: 0 },
          }),
    [trimmedKeyword, selectedCategory],
  );

  const categories = categoryResource.data?.categories ?? [];
  const filteredItems = resultResource.data?.items ?? [];

  const hasKeyword = trimmedKeyword.length > 0;
  const isEmpty = hasKeyword && filteredItems.length === 0;

  return (
    <ScreenLayout title="품목 검색" eyebrow="GET /items/search" description="최근/인기 검색어와 카테고리로 빠르게 찾습니다.">
      <View style={styles.searchBox}>
        <TextInput
          value={keyword}
          onChangeText={setKeyword}
          placeholder="계란, 라면, 세제"
          style={styles.searchInput}
          returnKeyType="search"
        />
        {keyword.length > 0 ? (
          <Pressable onPress={() => setKeyword('')}>
            <Text style={styles.clearText}>지우기</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.categoryWrap}>
        <Chip label="전체" selected={selectedCategory === 'all'} onPress={() => setSelectedCategory('all')} />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
          />
        ))}
      </View>

      {!hasKeyword ? (
        <>
          <Card>
            <SectionTitle title="최근 검색어" />
            <View style={styles.keywordWrap}>
              {RECENT_KEYWORDS.map((item) => (
                <Chip key={item} label={item} onPress={() => setKeyword(item)} />
              ))}
            </View>
          </Card>

          <Card>
            <SectionTitle title="많이 찾는 품목" />
            <View style={styles.keywordWrap}>
              {POPULAR_KEYWORDS.map((item) => (
                <Chip key={item} label={item} onPress={() => setKeyword(item)} />
              ))}
            </View>
          </Card>

          <View style={styles.linkRow}>
            <Button label="카테고리 보기" variant="secondary" onPress={() => navigation.navigate('Categories')} />
            <Button label="가격 비교" variant="secondary" onPress={() => navigation.navigate('CompareSelect')} />
          </View>
        </>
      ) : null}

      {hasKeyword && !isEmpty ? (
        <>
          <SectionTitle title="검색 결과" action={resultResource.loading ? '검색 중' : `${filteredItems.length}개`} />
          {filteredItems.map((item) => (
            <PriceRow
              key={item.id}
              name={item.name}
              meta={`${item.categoryName} · ${item.unit}`}
              price={item.avgPrice}
              changeRate={item.changeRate7d}
              decision={item.decision}
              onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
            />
          ))}
          <Button label="필터/정렬" variant="secondary" onPress={() => navigation.navigate('ItemFilter')} />
        </>
      ) : null}

      {isEmpty ? (
        <EmptyState
          title="검색 결과가 없습니다"
          description="검색어를 줄이거나 추천 검색어로 다시 찾아보세요."
          actionLabel="추천 검색어 보기"
          onPress={() => navigation.navigate('SearchEmpty', { keyword })}
        />
      ) : null}

      {resultResource.error ? (
        <EmptyState
          title="검색 API 연결 실패"
          description={resultResource.error}
          actionLabel="다시 시도"
          onPress={resultResource.reload}
        />
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    minHeight: 48,
    borderRadius: radius.control,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: colors.primary,
    fontSize: typography.body,
  },
  clearText: {
    color: colors.info,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  keywordWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  linkRow: {
    gap: 10,
    marginBottom: 20,
  },
});
