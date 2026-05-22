import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors } from '../theme/theme';

type PlaceholderScreenProps = {
  title: string;
  routePath: string;
  api?: string;
  state?: string;
  notes?: string[];
  navigation?: any;
};

export function PlaceholderScreen({
  title,
  routePath,
  api = '-',
  state = '-',
  notes = [],
  navigation,
}: PlaceholderScreenProps) {
  return (
    <ScreenLayout title={title} description={routePath}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>개발 기준</Text>

        <View style={styles.row}>
          <Text style={styles.label}>route</Text>
          <Text style={styles.value}>{routePath}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>api</Text>
          <Text style={styles.value}>{api}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>state</Text>
          <Text style={styles.value}>{state}</Text>
        </View>
      </View>

      {notes.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>구현 메모</Text>
          {notes.map((note) => (
            <Text key={note} style={styles.note}>
              • {note}
            </Text>
          ))}
        </View>
      ) : null}

      {navigation?.canGoBack?.() ? (
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>이전 화면으로</Text>
        </Pressable>
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  row: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  note: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  backButton: {
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.background,
  },
});