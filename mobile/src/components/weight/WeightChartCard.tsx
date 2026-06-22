import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useThemeStore } from '../../store/themeStore';
import { Spacing, Typography, BorderRadius , AppColors } from '../../theme';
import { WeightLog } from '../../types/weight';

interface Props {
  logs: WeightLog[];
}

const CHART_WIDTH = Dimensions.get('window').width - Spacing.md * 2 - Spacing.md * 2;
const MAX_POINTS = 60;

function shortDate(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function WeightChartCard({ logs }: Props) {
  const { colors } = useThemeStore();
  const s = styles(colors);

  // Use most recent MAX_POINTS, already sorted oldest→newest by hook
  const slice = logs.length > MAX_POINTS ? logs.slice(logs.length - MAX_POINTS) : logs;

  const chartData = useMemo(() => {
    return slice.map((log, i) => ({
      value: log.weightValue,
      label: i === 0 || i === slice.length - 1 || i % Math.max(1, Math.floor(slice.length / 5)) === 0
        ? shortDate(log.loggedAt)
        : '',
      dataPointText: '',
    }));
  }, [slice]);

  const values = slice.map(l => l.weightValue);
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 100;
  const padding = Math.max((maxVal - minVal) * 0.15, 1);
  const yMin = Math.floor(minVal - padding);
  const yMax = Math.ceil(maxVal + padding);
  const yStep = Math.max(Math.ceil((yMax - yMin) / 5), 1);

  if (slice.length < 2) {
    return (
      <View style={[s.card, s.emptyCard]}>
        <Text style={s.emptyText}>
          {logs.length < 2
            ? 'Log at least 2 weigh-ins to see your trend chart'
            : 'Not enough data to display a chart'}
        </Text>
      </View>
    );
  }

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Weight Trend</Text>
      <LineChart
        data={chartData}
        width={CHART_WIDTH}
        height={180}
        color={colors.primary}
        thickness={2}
        dataPointsColor={colors.primary}
        dataPointsRadius={3}
        startFillColor={colors.primary}
        startOpacity={0.18}
        endFillColor={colors.background}
        endOpacity={0}
        areaChart
        curved
        yAxisTextStyle={{ color: colors.textDisabled, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: colors.textDisabled, fontSize: 10 }}
        rulesColor={colors.border}
        rulesType="solid"
        yAxisColor={colors.border}
        xAxisColor={colors.border}
        backgroundColor={colors.surface}
        noOfSections={5}
        maxValue={yMax}
        stepValue={yStep}
        hideDataPoints={slice.length > 30}
        pointerConfig={{
          pointerStripHeight: 140,
          pointerStripColor: colors.primary + '55',
          pointerStripWidth: 1,
          pointerColor: colors.primary,
          radius: 5,
          pointerLabelWidth: 80,
          pointerLabelHeight: 40,
          activatePointersOnLongPress: false,
          autoAdjustPointerLabelPosition: true,
          pointerLabelComponent: (items: Array<{ value?: number }>) => {
            const item = items[0];
            return (
              <View style={s.tooltip}>
                <Text style={s.tooltipText}>{item?.value?.toFixed(1)}</Text>
              </View>
            );
          },
        }}
      />
    </View>
  );
}

const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
    },
    emptyCard: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.xl,
    },
    cardTitle: {
      fontSize: Typography.sm,
      fontWeight: Typography.semibold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: Spacing.md,
    },
    emptyText: {
      fontSize: Typography.sm,
      color: colors.textDisabled,
      textAlign: 'center',
    },
    tooltip: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: BorderRadius.sm,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tooltipText: {
      fontSize: Typography.sm,
      fontWeight: Typography.bold,
      color: colors.textPrimary,
    },
  });
