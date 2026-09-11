import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Car, Gauge, Tag } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/theme';

const STEPS = [
  { id: 1, label: 'Make & Model', shortLabel: 'Vehicle', icon: Car },
  { id: 2, label: 'Engine Trim', shortLabel: 'Engine', icon: Gauge },
  { id: 3, label: 'Verified Parts', shortLabel: 'Parts', icon: Tag },
];

const JourneyStepIndicator = ({ currentStep = 1, onStepPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isPending = step.id > currentStep;
          const canPress = isCompleted && onStepPress;

          return (
            <React.Fragment key={step.id}>
              {/* Connector line between steps */}
              {idx > 0 && (
                <View
                  style={[
                    styles.connector,
                    isCompleted || isActive ? styles.connectorActive : styles.connectorPending,
                  ]}
                />
              )}

              {/* Step Circle & Label */}
              <TouchableOpacity
                style={styles.stepItem}
                onPress={() => canPress && onStepPress(step.id)}
                disabled={!canPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.circleCompleted,
                    isActive && styles.circleActive,
                    isPending && styles.circlePending,
                  ]}
                >
                  {isCompleted ? (
                    <Check size={14} color={COLORS.white} strokeWidth={3} />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        isActive && styles.stepNumberActive,
                        isPending && styles.stepNumberPending,
                      ]}
                    >
                      {step.id}
                    </Text>
                  )}
                </View>

                <Text
                  style={[
                    styles.label,
                    isActive && styles.labelActive,
                    isCompleted && styles.labelCompleted,
                    isPending && styles.labelPending,
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingVertical: 6,
    paddingHorizontal: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceSecondary,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    width: 75,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxs,
  },
  circleCompleted: {
    backgroundColor: COLORS.primary,
  },
  circleActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  circlePending: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepNumber: {
    fontFamily: FONTS.family.bold,
    fontSize: 10,
    fontWeight: FONTS.weight.bold,
  },
  stepNumberActive: {
    color: COLORS.white,
  },
  stepNumberPending: {
    color: COLORS.textMuted,
  },
  label: {
    fontFamily: FONTS.family.semiBold,
    fontSize: 10,
    fontWeight: FONTS.weight.semiBold,
    textAlign: 'center',
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weight.bold,
  },
  labelCompleted: {
    color: COLORS.primaryDark,
  },
  labelPending: {
    color: COLORS.textMuted,
  },
  connector: {
    flex: 1,
    height: 2,
    marginTop: -14,
    marginHorizontal: SPACING.xxs,
    borderRadius: 1,
  },
  connectorActive: {
    backgroundColor: COLORS.primary,
  },
  connectorPending: {
    backgroundColor: COLORS.border,
  },
});

export default JourneyStepIndicator;
