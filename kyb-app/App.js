import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { AuthProvider } from './src/core/auth/AuthContext';
import RootNavigator from './src/core/navigation/RootNavigator';
import { navigationRef } from './src/functions/navigationRefFunc';
import { AppModal } from './src/components/common/AppModal';
import ErrorBoundary from './src/components/ErrorBoundary';

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <Provider store={store}>
          <AuthProvider>
            <SafeAreaProvider>
              <KeyboardAvoidingView
                style={styles.rootAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              >
                <NavigationContainer ref={navigationRef}>
                  <RootNavigator />
                </NavigationContainer>
                <AppModal />
              </KeyboardAvoidingView>
            </SafeAreaProvider>
          </AuthProvider>
        </Provider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  rootAvoid: {
    flex: 1,
  },
});

export default App;
