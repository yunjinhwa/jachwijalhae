import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../theme/theme';
import { API_KEY_REQUIRED } from '../services/apiClient';
import { Decision } from '../types/domain';
import { formatWon } from '../utils/format';

type CardProps = {
  children: React.ReactNode;
  compact?: boolean;
};

export function Card({ children, compact = false }: CardProps) {
  return <View style={[styles.card, compact && styles.cardCompact]}>{children}</View>;
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'text' && styles.buttonTextOnly,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.buttonLabel,
          variant === 'secondary' && styles.buttonSecondaryLabel,
          variant === 'text' && styles.buttonTextOnlyLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

export function Metric({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}) {
  return (
    <View style={[styles.metric, toneStyles[tone].soft]}>
      <Text style={[styles.metricValue, toneStyles[tone].text]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function DecisionBadge({ decision }: { decision: Decision }) {
  const text = {
    BUY: '사기 좋음',
    WAIT: '기다리기',
    REPLACE: '대체 추천',
    NEUTRAL: '평균 수준',
  }[decision];

  const tone = {
    BUY: 'success',
    WAIT: 'warning',
    REPLACE: 'info',
    NEUTRAL: 'default',
  }[decision] as keyof typeof toneStyles;

  return (
    <View style={[styles.badge, toneStyles[tone].soft]}>
      <Text style={[styles.badgeText, toneStyles[tone].text]}>{text}</Text>
    </View>
  );
}

export function PriceRow({
  name,
  meta,
  price,
  changeRate,
  decision,
  onPress,
}: {
  name: string;
  meta?: string;
  price: number;
  changeRate?: number;
  decision?: Decision;
  onPress?: () => void;
}) {
  const changeTone = (changeRate ?? 0) > 0 ? styles.negativeChange : styles.positiveChange;

  return (
    <Pressable onPress={onPress} style={styles.priceRow}>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {name}
        </Text>
        {meta ? (
          <Text style={styles.rowMeta} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      <View style={styles.rowSide}>
        <Text style={styles.rowPrice}>{formatWon(price)}</Text>
        <View style={styles.rowInline}>
          {typeof changeRate === 'number' ? (
            <Text style={[styles.changeText, changeTone]}>
              {changeRate > 0 ? '+' : ''}
              {changeRate}%
            </Text>
          ) : null}
          {decision ? <DecisionBadge decision={decision} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function DataNotice({
  updatedAt,
  source,
  requiresApiKey = false,
}: {
  updatedAt?: string;
  source?: string;
  requiresApiKey?: boolean;
}) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeTitle}>데이터 기준</Text>
      <Text style={styles.noticeBody}>
        {source ?? '공공데이터'} 기준이며 실제 판매가와 다를 수 있습니다.
      </Text>
      {updatedAt ? <Text style={styles.noticeMeta}>갱신 {updatedAt}</Text> : null}
      {requiresApiKey ? <Text style={styles.apiKeyText}>{API_KEY_REQUIRED}</Text> : null}
    </View>
  );
}

export function MiniChart({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);

  return (
    <View style={styles.chart}>
      {values.map((value, index) => {
        const height = 24 + ((value - min) / range) * 84;

        return (
          <View key={`${value}-${index}`} style={styles.chartColumn}>
            <View style={[styles.chartBar, { height }]} />
          </View>
        );
      })}
    </View>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onPress,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  return (
    <Card>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {actionLabel ? <Button label={actionLabel} onPress={onPress} variant="secondary" /> : null}
    </Card>
  );
}

const toneStyles = {
  default: {
    soft: { backgroundColor: colors.surface },
    text: { color: colors.primary },
  },
  success: {
    soft: { backgroundColor: colors.successSoft },
    text: { color: colors.success },
  },
  warning: {
    soft: { backgroundColor: colors.warningSoft },
    text: { color: '#92400E' },
  },
  danger: {
    soft: { backgroundColor: colors.dangerSoft },
    text: { color: colors.danger },
  },
  info: {
    soft: { backgroundColor: colors.infoSoft },
    text: { color: colors.info },
  },
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginBottom: 16,
    gap: 12,
  },
  cardCompact: {
    padding: 12,
    marginBottom: 10,
  },
  button: {
    minHeight: 48,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonTextOnly: {
    minHeight: 44,
    backgroundColor: 'transparent',
  },
  buttonLabel: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '700',
  },
  buttonSecondaryLabel: {
    color: colors.primary,
  },
  buttonTextOnlyLabel: {
    color: colors.info,
  },
  disabled: {
    opacity: 0.35,
  },
  chip: {
    minHeight: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: typography.section,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionAction: {
    fontSize: typography.caption,
    color: colors.info,
    fontWeight: '700',
  },
  metric: {
    flex: 1,
    minHeight: 82,
    borderRadius: radius.card,
    padding: 12,
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  metricLabel: {
    marginTop: 4,
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  priceRow: {
    minHeight: 68,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '800',
    marginBottom: 4,
  },
  rowMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  rowSide: {
    alignItems: 'flex-end',
    gap: 6,
  },
  rowPrice: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  rowInline: {
    alignItems: 'flex-end',
    gap: 5,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  positiveChange: {
    color: colors.success,
  },
  negativeChange: {
    color: colors.danger,
  },
  infoRow: {
    minHeight: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  infoValue: {
    flex: 1,
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '700',
    textAlign: 'right',
  },
  notice: {
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
    gap: 4,
  },
  noticeTitle: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },
  noticeBody: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  noticeMeta: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  apiKeyText: {
    marginTop: 4,
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  chart: {
    height: 132,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderRadius: 4,
    backgroundColor: colors.info,
  },
  emptyTitle: {
    color: colors.primary,
    fontSize: typography.section,
    fontWeight: '800',
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
  },
});
