import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import { AuraAPI, AuthResponse } from "./src/services/api";

export default function App() {
  const [auth, setAuth] = useState<AuthResponse | null>(null);

  const handleLogin = (payload: AuthResponse) => {
    AuraAPI.setAuthToken(payload.access_token);
    setAuth(payload);
  };

  const handleLogout = () => {
    AuraAPI.clearAuthToken();
    setAuth(null);
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0F172A" />
      {auth ? (
        <HomeScreen token={auth.access_token} userName={auth.user.nome} onLogout={handleLogout} />
      ) : (
        <LoginScreen onSuccess={handleLogin} />
      )}
    </SafeAreaProvider>
  );
}
