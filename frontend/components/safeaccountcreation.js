import React, { useEffect, useState } from "react";
import { getUserSafe } from "./safemethods";
import { EthersAdapter } from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import Safe, { SafeFactory } from "@safe-global/protocol-kit";
import SafeApiKit from "@safe-global/api-kit";
import { useRouter } from "next/router";
import { useAuth } from "../auth-context/auth";

const SafeAccountCreation = () => {
  const {
    provider,
    setProvider,
    signer,
    setSigner,
    safeSdk,
    setSafeSDK,
    safeAddress,
    setSafeAddress,
  } = useAuth();

  useEffect(() => {
    if (provider) {
      setIsLoggedIn(true);
    }
  }, [provider]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [safeSetupComplete, setsafeSetupComplete] = useState(false);
  const [isLoading, setisLoading] = useState(false);

  const router = useRouter();

  const login = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    const signer = provider.getSigner();
    setSigner(signer);
    const eoa = await signer.getAddress();
    console.log(eoa);
    console.log(provider);
  };

  const createSafeWallet = async () => {
    try {
      setisLoading(true);
      if (!signer) {
        console.log("SignIn/ SignUp");
        return;
      }
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer,
      });

      const safeFactory = await SafeFactory.create({
        ethAdapter: ethAdapter,
      });

      const safeService = new SafeApiKit({
        txServiceUrl: "https://safe-transaction-goerli.safe.global",
        ethAdapter,
      });

      const owners = [`${await signer.getAddress()}`];
      const threshold = 1;

      const safeAddress = await getUserSafe(signer);
      console.log(safeAddress);
      if (safeAddress) {
        const safeSDK = await Safe.create({ ethAdapter, safeAddress });

        // await enableModule(safeSDK,recoveryModuleContractAddress)
        setSafeSDK(safeSDK);
        setSafeAddress(safeAddress);
        setsafeSetupComplete(true);
        setisLoading(false);

        return;
      }

      const safeAccountConfig = {
        owners,
        threshold,
      };
      console.log(safeAccountConfig);
      // / Will it have gas fees to deploy this safe tx
      const safeSdk = await safeFactory.deploySafe({ safeAccountConfig });

      console.log("Creating and deploying the new safe");

      // const newSafeAddress = "0x2c4ed5ea89D8231C4E64F02f0da4E5ffcE4263D9";

      // / wait for the deployement to be completed
      const newSafeAddress = await safeSdk.getAddress();

      if (newSafeAddress) {
        setsafeSetupComplete(true);
        setisLoading(false);
      }

      setSafeSDK(safeSdk);
      setSafeAddress(newSafeAddress);

      // enableModule(safeSdk, newSafeAddress);

      /// On Continue, direct to the home page
      setisLoading(false);
      console.log(`created account : ${newSafeAddress}`);
    } catch (error) {
      console.log(error);
    }
  };

  const enableModule = async () => {
    // createSafeWallet();
    console.log(safeSdk);
    const moduleAddress = "0xE16A91E4f873DeeAfA675AAE592961ceafA5E44B";
    const isEnabled = await safeSdk.isModuleEnabled(moduleAddress);

    if (!isEnabled) {
      const safeTransaction = await safeSdk.createEnableModuleTx(moduleAddress);
      const txResponse = await safeSdk.executeTransaction(safeTransaction);
      await txResponse.transactionResponse?.wait();

      console.log(txResponse);
      return txResponse;
    } else {
      console.log("Module Already Enabled");
    }
  };

  return (
    <div>
      <button
        className="px-7 mx-5 py-1.5 rounded-xl bg-white text-indigo-500 border border-indigo-500 font-semibold hover:scale-105 duration-200"
        onClick={createSafeWallet}
      >
        Create Safe
      </button>
      {/* <button
        className="bg-blue-500 text-500 px-3 py-2 rounded-xl font-semibold text-white"
        onClick={enableModule}
      >
        Enable Module
      </button> */}
    </div>
  );
};

export default SafeAccountCreation;
