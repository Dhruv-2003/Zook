import React, { createContext } from "react";
import { useContext, useState, useEffect , useRef} from "react";
import { ethers } from "ethers";
import { getUserSafe } from "../components/safemethods";
import { EthersAdapter } from "@safe-global/protocol-kit";
import Safe from "@safe-global/protocol-kit";
import { Client } from "@xmtp/xmtp-js";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }) {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [safeSdk, setSafeSDK] = useState();
  const [safeAddress, setSafeAddress] = useState();
  const [xmtp_client, setxmtp_client] = useState(null)
  const convRef = useRef(null);
  const clientRef = useRef(null);
  const [peerAddress, setPeerAddress] = useState();

  useEffect(() => {
    if (!provider) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      const signer = provider.getSigner();
      setSigner(signer);
    }
    getSafe()
  }, []);

  async function getSafe() {
    if (provider && signer) {
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer,
      });
      const safeAddress = await getUserSafe(signer);
      if (safeAddress) {
        const safeSDK = await Safe.create({ ethAdapter, safeAddress });
        setSafeSDK(safeSDK);
        console.log(safeSdk);
      }
    }
  }

  const value = {
    setProvider,
    provider,
    signer,
    setSigner,
    safeSdk,
    setSafeSDK,
    safeAddress,
    setSafeAddress,
    xmtp_client,
    setxmtp_client,
    convRef,
    clientRef,
    peerAddress,
    setPeerAddress
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
