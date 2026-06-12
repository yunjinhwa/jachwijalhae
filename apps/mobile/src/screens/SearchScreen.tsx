import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { Button, Card, Chip, EmptyState, PriceRow, SectionTitle } from '../components/ui';
import { useApiResource } from '../hooks/useApiResource';
import { jachwiApi } from '../services/jachwiApi';
import { usePreferenceStore } from '../store/usePreferenceStore';
import { colors, radius, typography } from '../theme/theme';
import type { PriceItem } from '../types/domain';
import { navigateStack } from '../utils/navigation';

const RECENT_KEYWORDS = ['계란', '라면', '화장지', '우유'];
const POPULAR_KEYWORDS = ['쌀', '대파', '세탁세제', '참치캔', '우유'];
const SEARCH_PAGE_SIZE = 30;

export function SearchScreen({ navigation }: any) {
  const preferredCategories = usePreferenceStore((state) => state.categories);
  const preferredKeywords = usePreferenceStore((state) => state.keywords);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(15);
  const [resultItems, setResultItems] = useState<PriceItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, size: SEARCH_PAGE_SIZE, total: 0, hasNext: false });
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);

  const trimmedKeyword = keyword.trim().toLowerCase();
  const preferenceKey = `${preferredCategories.join('|')}::${preferredKeywords.join('|')}`;
  const shouldFetchResults =
    trimmedKeyword.length > 0 ||
    selectedCategory !== 'all' ||
    preferredCategories.length > 0 ||
    preferredKeywords.length > 0;
  const recentKeywords = useMemo(
    () => Array.from(new Set([...preferredKeywords, ...RECENT_KEYWORDS])).slice(0, 8),
    [preferredKeywords],
  );
  const popularKeywords = useMemo(
    () => Array.from(new Set([...POPULAR_KEYWORDS, ...preferredCategories])).slice(0, 8),
    [preferredCategories],
  );
  const categoryResource = useApiResource(() => jachwiApi.getCategories(), []);

  const loadSearchPage = useCallback(
    async (page: number) => {
      if (!shouldFetchResults) return;

      const append = page > 1;
      setResultError(null);
      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingResults(true);
      }

      try {
        const data = await jachwiApi.searchItems({
          q: trimmedKeyword || undefined,
          categoryId: selectedCategory,
          interestOnly: !trimmedKeyword,
          page,
          size: SEARCH_PAGE_SIZE,
        });

        setPagination({
          page: data.pagination.page,
          size: data.pagination.size,
          total: data.pagination.total,
          hasNext: Boolean(data.pagination.hasNext),
        });
        setResultItems((prev) => {
          if (!append) return data.items;

          const seenIds = new Set(prev.map((item) => item.id));
          return [...prev, ...data.items.filter((item) => !seenIds.has(item.id))];
        });
      } catch (error) {
        setResultError(error instanceof Error ? error.message : '검색 결과를 불러오지 못했습니다.');
      } finally {
        setLoadingResults(false);
        setLoadingMore(false);
      }
    },
    [shouldFetchResults, trimmedKeyword, selectedCategory, preferenceKey],
  );

  useEffect(() => {
    setVisibleCount(15);
    setResultItems([]);
    setPagination({ page: 1, size: SEARCH_PAGE_SIZE, total: 0, hasNext: false });
    setResultError(null);

    if (shouldFetchResults) {
      void loadSearchPage(1);
    }
  }, [loadSearchPage, shouldFetchResults]);

  const categories = categoryResource.data?.categories ?? [];
  const filteredItems = resultItems;
  const visibleItems = filteredItems.slice(0, visibleCount);
  const canRevealMore = visibleCount < filteredItems.length;
  const canFetchMore = pagination.hasNext && !loadingResults && !loadingMore;

  const hasKeyword = trimmedKeyword.length > 0;
  const hasInterestQuery = !hasKeyword && filteredItems.length > 0;
  const isLoadingResults = shouldFetchResults && loadingResults && filteredItems.length === 0;
  const isEmpty = shouldFetchResults && !isLoadingResults && !resultError && filteredItems.length === 0;

  useEffect(() => {
    setVisibleCount(15);
  }, [trimmedKeyword, selectedCategory]);

  return (
    <ScreenLayout
      title="품목 검색"
      eyebrow="GET /items/search"
      description="최근/인기 검색어와 카테고리로 빠르게 찾습니다."
      onEndReached={() => {
        if (canRevealMore) {
          setVisibleCount((count) => Math.min(count + 15, filteredItems.length));
          return;
        }

        if ((hasKeyword || hasInterestQuery || selectedCategory !== 'all') && canFetchMore) {
          void loadSearchPage(pagination.page + 1);
        }
      }}
    >
      <View style={styles.searchBox}>
        <TextInput
          testID="search-input"
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
              {recentKeywords.map((item) => (
                <Chip key={item} label={item} onPress={() => setKeyword(item)} />
              ))}
            </View>
          </Card>

          <Card>
            <SectionTitle title="많이 찾는 품목" />
            <View style={styles.keywordWrap}>
              {popularKeywords.map((item) => (
                <Chip key={item} label={item} onPress={() => setKeyword(item)} />
              ))}
            </View>
          </Card>

          <View style={styles.linkRow}>
            <Button label="카테고리 보기" variant="secondary" onPress={() => navigateStack(navigation, 'Categories')} />
            <Button label="가격 비교" variant="secondary" onPress={() => navigateStack(navigation, 'CompareSelect')} />
          </View>

          {hasInterestQuery ? (
            <>
              <SectionTitle title="내 관심 품목" action={`${visibleItems.length}/${pagination.total}개`} />
              {visibleItems.map((item) => (
                <PriceRow
                  key={item.id}
                  name={item.name}
                  meta={`${item.categoryName} · ${item.unit}`}
                  price={item.avgPrice}
                  changeRate={item.changeRate7d}
                  decision={item.decision}
                  onPress={() => navigateStack(navigation, 'ItemDetail', { itemId: item.id })}
                />
              ))}
            </>
          ) : null}
        </>
      ) : null}

      {isLoadingResults ? (
        <Card>
          <SectionTitle title="검색 중" />
          <Text style={styles.loadingText}>서버에서 최신 가격 데이터를 불러오고 있습니다.</Text>
        </Card>
      ) : null}

      {(hasKeyword || selectedCategory !== 'all') && !isLoadingResults && !resultError && !isEmpty ? (
        <>
          <SectionTitle title="검색 결과" action={loadingMore ? '추가 로딩 중' : `${visibleItems.length}/${pagination.total}개`} />
          {visibleItems.map((item) => (
            <PriceRow
              key={item.id}
              name={item.name}
              meta={`${item.categoryName} · ${item.unit}`}
              price={item.avgPrice}
              changeRate={item.changeRate7d}
              decision={item.decision}
              onPress={() => navigateStack(navigation, 'ItemDetail', { itemId: item.id })}
            />
          ))}
          {canRevealMore || canFetchMore ? <Text style={styles.loadingText}>아래로 더 내려가면 품목을 더 불러옵니다.</Text> : null}
          <Button label="필터/정렬" variant="secondary" onPress={() => navigateStack(navigation, 'ItemFilter')} />
        </>
      ) : null}

      {isEmpty ? (
        <EmptyState
          title="검색 결과가 없습니다"
          description="검색어를 줄이거나 추천 검색어로 다시 찾아보세요."
          actionLabel="추천 검색어 보기"
          onPress={() => navigateStack(navigation, 'SearchEmpty', { keyword })}
        />
      ) : null}

      {resultError ? (
        <EmptyState
          title="검색 연결 실패"
          description={resultError}
          actionLabel="다시 시도"
          onPress={() => void loadSearchPage(1)}
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
  loadingText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18,
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
