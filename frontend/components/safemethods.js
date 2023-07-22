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
  const moduleAddress = "0x2B74083B670009fA63e7CceC16A0400cc202f7c8";
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
