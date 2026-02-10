import { Component, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import i18n from 'i18next';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (__DEV__) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>{i18n.t('common.errorTitle')}</Text>
            <Text style={styles.message}>
              {this.state.error?.message || i18n.t('common.errorDefault')}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.setState({ hasError: false, error: null })}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>{i18n.t('common.tryAgain')}</Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    width: '100%',
    ...SHADOWS.md,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: FONTS.display,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  message: {
    fontSize: 20,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.brand600,
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    ...SHADOWS.sm,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.textInverse,
  },
});
