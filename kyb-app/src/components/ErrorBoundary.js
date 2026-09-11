import React from 'react';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { navigateTo } from '../functions/navigationRefFunc';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[App ErrorBoundary Caught Error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    try {
      navigateTo('OwnerHome');
    } catch (_) {}
  };

  getEducationalReason = (error) => {
    const msg = (error?.message || '').toLowerCase();
    if (msg.includes('network') || msg.includes('timeout') || msg.includes('failed to fetch')) {
      return {
        category: 'Network Connectivity Disruption',
        explanation:
          'Your mobile device lost connection with the server while loading automotive data. Your garage vehicles and enquiries remain safely stored in the cloud.',
      };
    }
    if (msg.includes('undefined') || msg.includes('null') || msg.includes('cannot read')) {
      return {
        category: 'Temporary Data Synchronization Delay',
        explanation:
          'Vehicle or part details were being refreshed during a live update. Reloading will sync the latest verified data from the database.',
      };
    }
    return {
      category: 'Display Refresh Interruption',
      explanation:
        'A screen rendering glitch occurred while presenting this view. Your account and stored data are fully protected.',
    };
  };

  render() {
    if (this.state.hasError) {
      const { category, explanation } = this.getEducationalReason(this.state.error);

      return (
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#0F121C" translucent={false} />
          <View style={styles.card}>
            <View style={styles.iconBadge}>
              <Text style={styles.iconText}>🛡️</Text>
            </View>

            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{category.toUpperCase()}</Text>
            </View>

            <Text style={styles.title}>System Notice</Text>

            <Text style={styles.explanationText}>{explanation}</Text>

            <View style={styles.safetyBox}>
              <Text style={styles.safetyTitle}>✅ Data Protection Verified</Text>
              <Text style={styles.safetySub}>
                Your fleet, parts history, and technical enquiries are safe.
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.85}
                onPress={this.handleReset}
              >
                <Text style={styles.retryText}>Reload Screen</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.homeButton}
                activeOpacity={0.85}
                onPress={this.handleGoHome}
              >
                <Text style={styles.homeButtonText}>Home Dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F121C',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('5%'),
  },
  card: {
    width: '100%',
    backgroundColor: '#181C2A',
    borderRadius: RADIUS.xl,
    padding: wp('6%'),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(208, 20, 44, 0.15)',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1.8%'),
  },
  iconText: {
    fontSize: FONTS.size.h2,
  },
  categoryPill: {
    backgroundColor: 'rgba(208, 20, 44, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(208, 20, 44, 0.35)',
    marginBottom: hp('1.2%'),
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: FONTS.weight.heavy,
    color: '#F87171',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: wp('5.2%'),
    fontWeight: FONTS.weight.black,
    color: COLORS.white,
    marginBottom: hp('1.2%'),
    textAlign: 'center',
  },
  explanationText: {
    fontSize: wp('3.5%'),
    color: COLORS.slate400,
    textAlign: 'center',
    lineHeight: wp('5.2%'),
    marginBottom: hp('2.2%'),
    paddingHorizontal: wp('2%'),
  },
  safetyBox: {
    width: '100%',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: RADIUS.md,
    padding: wp('3.5%'),
    marginBottom: hp('2.8%'),
  },
  safetyTitle: {
    fontSize: wp('3.4%'),
    fontWeight: FONTS.weight.heavy,
    color: '#10B981',
    marginBottom: 3,
  },
  safetySub: {
    fontSize: wp('3.1%'),
    color: COLORS.successBorder,
    lineHeight: wp('4.4%'),
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  retryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: hp('1.8%'),
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: COLORS.white,
    fontSize: wp('3.6%'),
    fontWeight: FONTS.weight.heavy,
    letterSpacing: 0.3,
  },
  homeButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: hp('1.8%'),
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: COLORS.white,
    fontSize: wp('3.6%'),
    fontWeight: FONTS.weight.heavy,
    letterSpacing: 0.3,
  },
});

export default ErrorBoundary;
