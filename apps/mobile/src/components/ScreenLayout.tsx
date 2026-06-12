import React, { useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme/theme';

type ScreenLayoutProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  onBack?: () => void;
  onEndReached?: () => void;
  scroll?: boolean;
  children?: React.ReactNode;
};

export function ScreenLayout({
  title,
  description,
  eyebrow,
  onBack,
  onEndReached,
  scroll = true,
  children,
}: ScreenLayoutProps) {
  const isApiLabel = eyebrow ? /\b(GET|POST|PATCH|PUT|DELETE)\b|\/[a-z]/i.test(eyebrow) : false;
  const isRouteDescription = description?.trim().startsWith('/');
  const reachedEndRef = useRef(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!onEndReached) return;

    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);

    if (distanceFromBottom < 96) {
      if (!reachedEndRef.current) {
        reachedEndRef.current = true;
        onEndReached();
      }
    } else if (distanceFromBottom > 180) {
      reachedEndRef.current = false;
    }
  };

  const content = (
    <View style={styles.content}>
      {onBack ? (
        <Pressable style={styles.backButton} onPress={onBack} hitSlop={8}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
      ) : null}
      {eyebrow && !isApiLabel ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description && !isRouteDescription ? <Text style={styles.description}>{description}</Text> : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={80}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: spacing.pageX,
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: colors.surface,
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  backIcon: {
    color: colors.info,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 30,
  },
  eyebrow: {
    fontSize: typography.caption,
    fontWeight: '800',
    color: colors.info,
    marginBottom: 8,
  },
  title: {
    fontSize: typography.title,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sectionGap,
  },
});
