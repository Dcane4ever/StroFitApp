import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '../../theme';
import EmptyStateCard from '../ui/EmptyStateCard';

interface Props {
  onCreateFirst: () => void;
}

export default function RecipeEmptyState({ onCreateFirst }: Props) {
  return (
    <View style={styles.root}>
      <EmptyStateCard
        icon="🍲"
        title="No recipes yet"
        body={"Save your go-to meals as recipes — adobo, sinigang, meal-prep containers.\nDefine serving sizes once so logging is always accurate."}
        actionLabel="Create First Recipe"
        onAction={onCreateFirst}
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
