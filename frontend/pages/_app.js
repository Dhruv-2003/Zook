import "../styles/globals.css";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { gnosis, sepolia, goerli } from "wagmi/chains";
import { AuthProvider } from "../auth-context/auth";
import { Navbar } from "../components/navbar";
import { ChakraProvider } from "@chakra-ui/react";

const chains = [gnosis, sepolia, goerli];
const projectId = "e332421b450f94125a7d3b2a85b27e49";

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

function MyApp({ Component, pageProps }) {
  return (
    <>
      <ChakraProvider>
        <AuthProvider>
          <WagmiConfig config={wagmiConfig}>
            <Navbar />
            <Component {...pageProps} />
          </WagmiConfig>
          <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
        </AuthProvider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
