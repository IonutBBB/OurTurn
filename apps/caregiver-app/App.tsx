import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

// Initialize i18n
import './src/i18n';

export default function App() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('common.appName')}</Text>
      <Text style={styles.subtitle}>{t('caregiverApp.auth.getStarted')}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0D9488',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#57534E',
  },
});
