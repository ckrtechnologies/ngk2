import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/theme';

const AppInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  placeholderTextColor = COLORS.textMuted,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon,
  rightIcon,
  onRightIconPress,
  rightActionText,
  onRightActionPress,
  rightActionColor = COLORS.primary,
  error,
  containerStyle,
  inputStyle,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {(label || rightActionText) && (
        <View style={styles.labelRow}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {rightActionText && (
            <TouchableOpacity
              onPress={onRightActionPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.rightAction, { color: rightActionColor }]}>
                {rightActionText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          multiline && styles.multilineContainer,
          error ? styles.inputError : null,
          !editable && styles.inputDisabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.base,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textSecondary,
    letterSpacing: FONTS.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  rightAction: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
    paddingHorizontal: SPACING.base,
  },
  multilineContainer: {
    height: 90,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  inputDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.8,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
  leftIconContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    marginLeft: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: FONTS.family.medium,
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.medium,
    color: COLORS.textPrimary,
    padding: 0,
    height: '100%',
  },
  multilineInput: {
    textAlignVertical: 'top',
    height: '100%',
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  errorText: {
    fontFamily: FONTS.family.medium,
    fontSize: FONTS.size.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
    fontWeight: FONTS.weight.medium,
  },
});

export default AppInput;
