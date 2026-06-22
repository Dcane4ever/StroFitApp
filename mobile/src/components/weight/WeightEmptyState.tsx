import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '../../theme';
import EmptyStateCard from '../ui/EmptyStateCard';

interface Props {
  onAdd: () => void;
}

export default function WeightEmptyState({ onAdd }: Props) {
  return (
    <View style={styles.root}>
      <EmptyStateCard
        icon="⚖️"
        title="No weigh-ins yet"
        body={"Log your weight regularly to see real progress over time.\nWeigh in the morning for consistent readings."}
        actionLabel="Log First Weigh-in"
        onAction={onAdd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xl,
    justifyContent: 'center',
  },
});
