import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView, StyleSheet } from 'react-native';
import { UserProvider } from './src/contexts/UserContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <SafeAreaView style={styles.safeArea}>
          <AppNavigator />
        </SafeAreaView>
      </UserProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
