import SafeApiKit from "@safe-global/api-kit";
import { EthersAdapter } from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import { useAuth } from "../auth-context/auth";

const intializeSafeAPI = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  });

  const safeSAPIService = new SafeApiKit({
    txServiceUrl: "https://safe-transaction-goerli.safe.global",
    ethAdapter,
  });

  return safeSAPIService;
};

export const getUserSafe = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const userAddress = await signer.getAddress();

  const safeService = intializeSafeAPI(signer);

  console.log(userAddress);
  const safes = await safeService.getSafesByOwner(userAddress);
  console.log(safes);

  const safeAddress = safes.safes[0];
  console.log(safeAddress);
  return safeAddress;
};

export const enableModule = async () => {
  const moduleAddress = "0xb0cd97B63643388f1600E88EAFfC883E6F7564CC";
  try {
    const safeTransaction = await safeSdk.createEnableModuleTx(moduleAddress);
    const txResponse = await safeSdk.executeTransaction(safeTransaction);
    await txResponse.transactionResponse?.wait();

    console.log(txResponse);
    return txResponse;
  } catch (error) {
    console.log(error);
  }
};

export const enableGuard = async () => {
  const guardAddress = "0xb0cd97B63643388f1600E88EAFfC883E6F7564CC";
  try {
    const safeTransaction = await safeSdk.createEnableGuardTx(guardAddress);
    const txResponse = await safeSdk.executeTransaction(safeTransaction);
    await txResponse.transactionResponse?.wait();

    console.log(txResponse);
    return txResponse;
  } catch (error) {
    console.log(error);
  }
};

export const isModuleEnabled = async (safeAddress, module) => {
  const res = await safe.isModuleEnabled(moduleAddress);
};
