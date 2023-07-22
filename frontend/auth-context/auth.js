import React, { createContext } from "react";
import { useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }) {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [safeSdk, setSafeSDK] = useState();
  const [safeAddress, setSafeAddress] = useState();

  const value = {
    setProvider,
    provider,
    signer,
    setSigner,
    safeSdk, setSafeSDK,
    safeAddress, setSafeAddress
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}