import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/theme';

type ScreenLayoutProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  scroll?: boolean;
  children?: React.ReactNode;
};

export function ScreenLayout({
  title,
  description,
  eyebrow,
  scroll = true,
  children,
}: ScreenLayoutProps) {
  const isApiLabel = eyebrow ? /\b(GET|POST|PATCH|PUT|DELETE)\b|\/[a-z]/i.test(eyebrow) : false;
  const isRouteDescription = description?.trim().startsWith('/');

  const content = (
    <View style={styles.content}>
      {eyebrow && !isApiLabel ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description && !isRouteDescription ? <Text style={styles.description}>{description}</Text> : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
    paddingHorizontal: spacing.pageX,
    paddingTop: 28,
    paddingBottom: 32,
    backgroundColor: colors.surface,
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
