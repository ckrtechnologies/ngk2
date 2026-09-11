import React from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';

const ENQUIRY_STEPS = [
  { id: 1, label: 'Part & Vehicle', shortLabel: 'Part & Specs' },
  { id: 2, label: 'Select Stockist', shortLabel: 'Dealer' },
  { id: 3, label: 'Query & Send', shortLabel: 'Send' },
];

const EnquiryStepIndicator = ({ currentStep = 1, onStepPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {ENQUIRY_STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isPending = step.id > currentStep;
          const canPress = (isCompleted || isActive) && onStepPress;

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
                    <Check size={13} color={COLORS.white} strokeWidth={3} />
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
    paddingVertical: 10,
    paddingHorizontal: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceSecondary,
    ...SHADOWS.sm,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    width: 90,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  circleCompleted: {
    backgroundColor: COLORS.primary,
  },
  circleActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  circlePending: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepNumber: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.xs,
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
    fontSize: FONTS.size.caption,
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
    marginTop: -16,
    marginHorizontal: SPACING.xs,
    borderRadius: 1,
  },
  connectorActive: {
    backgroundColor: COLORS.primary,
  },
  connectorPending: {
    backgroundColor: COLORS.border,
  },
});

export default EnquiryStepIndicator;
