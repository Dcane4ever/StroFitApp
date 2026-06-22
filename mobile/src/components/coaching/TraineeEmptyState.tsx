import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '../../theme';
import EmptyStateCard from '../ui/EmptyStateCard';

interface Props {
  onInvite: () => void;
}

export default function TraineeEmptyState({ onInvite }: Props) {
  return (
    <View style={styles.root}>
      <EmptyStateCard
        icon="👤"
        title="No trainees yet"
        body={"Invite a client to link them to your coaching profile.\nYou'll be able to monitor their weight progress, diary adherence, and food budget."}
        actionLabel="Invite First Trainee"
        onAction={onInvite}
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
