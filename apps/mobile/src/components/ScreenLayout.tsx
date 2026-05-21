import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/theme';

type ScreenLayoutProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function ScreenLayout({ title, description, children }: ScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.pageX,
    paddingTop: 40,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.display,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sectionGap,
  },
});