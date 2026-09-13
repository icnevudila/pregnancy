import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors, fonts } from './theme';
import { BrandMark } from './Icons';
import { T, Tap } from './ui';
import { analytics } from './services/analytics';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Momora Crash Boundary caught an error:', error, errorInfo);
    try {
      analytics.logEvent('app_crash', {
        message: error?.message || 'Unknown error',
        componentStack: errorInfo?.componentStack || '',
      });
    } catch (e) {}
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const isEn = this.props.lang === 'en';
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.iconCircle}>
              <BrandMark size={48} />
            </View>
            <T bold style={styles.title}>
              {isEn ? 'Something went wrong 🌸' : 'Küçük bir aksaklık oldu 🌸'}
            </T>
            <T style={styles.subtitle}>
              {isEn
                ? 'Your data is safely preserved on your device. We stopped this screen gently so you can continue without stress.'
                : 'Verilerin cihazında güvenle korunuyor. Stres yaşamaman için ekranı sakince durdurduk.'}
            </T>

            {__DEV__ && this.state.error && (
              <View style={styles.devBox}>
                <T bold style={{ fontSize: 11, color: '#B42318' }}>DEV ERROR INFO:</T>
                <T style={{ fontSize: 11, color: '#7A271A', marginTop: 4 }}>
                  {this.state.error.toString()}
                </T>
              </View>
            )}

            <Tap
              onPress={this.resetError}
              label={isEn ? 'Reload Application' : 'Uygulamayı Yenile'}
              style={styles.retryBtn}
            >
              <T bold style={{ color: 'white', fontSize: 15 }}>
                {isEn ? 'Try Again 🌿' : 'Tekrar Dene 🌿'}
              </T>
            </Tap>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FAF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 320,
    marginBottom: 24,
  },
  devBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#F8D0D0',
    marginBottom: 20,
    maxWidth: 340,
  },
  retryBtn: {
    backgroundColor: colors.purple,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },
});
