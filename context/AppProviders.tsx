import React, { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { Provider, useDispatch, useSelector } from 'react-redux';

import { PersistGate } from 'redux-persist/integration/react';

import { NavigationGuard } from '../components/NavigationGuard';
import { AppDispatch, persistor, store } from '../store';
import { checkOnboardingStatus } from '../store/slices/authSlice';
import { AuthProvider } from './AuthContext';
import { OverlayProvider } from './OverlayProvider';
import { TeamProvider } from './TeamContext';

const OnboardingInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const onboardingChecked = useSelector((state: any) => state.auth.onboardingChecked);

  useEffect(() => {
    if (!onboardingChecked) {
      dispatch(checkOnboardingStatus());
    }
  }, [dispatch, onboardingChecked]);

  return <>{children}</>;
};

export const AppProviders: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <OnboardingInitializer>
          <AuthProvider>
            <NavigationGuard>
              <TeamProvider>
                <OverlayProvider>
                  {children}
                  <Toast />
                </OverlayProvider>
              </TeamProvider>
            </NavigationGuard>
          </AuthProvider>
        </OnboardingInitializer>
      </PersistGate>
    </Provider>
  );
};
