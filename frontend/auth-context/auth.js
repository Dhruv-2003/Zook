import React, { createContext } from "react";
import { useContext, useState, useEffect } from "react";
import {ethers} from "ethers"

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }) {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [safeSdk, setSafeSDK] = useState();
  const [safeAddress, setSafeAddress] = useState();

  useEffect(() => {
    if (!provider) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      const signer = provider.getSigner();
      setSigner(signer);
    }
  }, []);

  const value = {
    setProvider,
    provider,
    signer,
    setSigner,
    safeSdk,
    setSafeSDK,
    safeAddress,
    setSafeAddress,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
