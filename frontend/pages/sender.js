import React, { useEffect, useRef } from "react";
import { Divider } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import { Contract, ethers } from "ethers";
import { useAuth } from "../auth-context/auth";
import { getUserSafe } from "../components/safemethods";
import { EthersAdapter } from "@safe-global/protocol-kit";
import Safe from "@safe-global/protocol-kit";
import {
  encodePacked,
  hashMessage,
  recoverAddress,
  recoverMessageAddress,
} from "viem";
import SafeAccountCreation from "../components/safeaccountcreation";

import {
  ERC1155NFTRecepeint_Goerli,
  channelModule_Goerli,
} from "../constants/contracts";
import { ERC1155Recepient_ABI, Module_ABI } from "../constants/abi";
import { usePublicClient, useWalletClient } from "wagmi";

const Sender = () => {
  const { safeSdk, signer, setSafeSDK, provider } = useAuth();
  const {
    isOpen: isOpen1,
    onOpen: onOpen1,
    onClose: onClose1,
  } = useDisclosure();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  async function getSafe() {
    if (provider && signer) {
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer,
      });
      const safeAddress = await getUserSafe(signer);
      console.log(safeAddress);
      if (safeAddress) {
        const safeSDK = await Safe.create({ ethAdapter, safeAddress });
        setSafeSDK(safeSDK);
        console.log(safeSdk);
      }
    }
  }

  const getUserTokenId = async () => {
    const NFT_Contract = new Contract(
      ERC1155NFTRecepeint_Goerli,
      ERC1155Recepient_ABI,
      provider
    );

    const tokenId = await NFT_Contract.senderTokenInfo(senderAddress);
  };

  const createNewChannel = async (recepient, duration) => {
    // creates a New Safe for this wallet , Channel specific
    // enable Module

    // Add record in the module

    const module_contract = new Contract(
      channelModule_Goerli,
      Module_ABI,
      signer
    );

    const tx = await module_contract.createChannel(
      safeAddress,
      recepient,
      duration,
      tokenId
    );

    await tx.wait();

    console.log(tx);
  };

  // Need to add the funds before to the Channel
  const addFundsToSafe = async () => {
    try {
      await getSafe();
      if (safeSdk) {
        const safeAddress = await safeSdk.getAddress();

        const safeAmount = ethers.utils
          .parseUnits("0.001", "ether")
          .toHexString();

        const transactionParameters = {
          to: safeAddress,
          value: safeAmount,
        };

        const tx = await signer.sendTransaction(transactionParameters);

        console.log("sending funds to safe account.");
        console.log(
          `Deposit Transaction: https://goerli.etherscan.io/tx/${tx.hash}`
        );
      } else {
        console.log(safeSdk);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const payRecepientViaChannel = async () => {
    /// generate the Message to be signed
    const msg = generateSignMessage(safeAddress, totalAmount);

    /// sign the Message
    const signature = await walletClient.signMessage(msg);

    /// create an attestation

    /// send an XMTP message along with signature itself
  };

  const generateSignMessage = (safeAddress, totalAmount) => {
    // safeAddress , totalOwedAmount
    const msg = encodePacked(["address", "uint256"], [safeAddress, amount]);
    return msg;
  };

  return (
    <div className="w-screen">
      <div className="flex flex-col w-2/3 justify-center mx-auto mt-20">
        <div className="w-full">
          <div className="flex justify-between align-middle">
            <div>
              <p className="text-xl text-indigo-500 font-semibold">Channels</p>
            </div>
            <div>
              <div className="flex">
                <SafeAccountCreation/>
                <button
                  onClick={onOpen1}
                  className="px-7 mx-5 py-1.5 rounded-xl bg-white text-indigo-500 border border-indigo-500 font-semibold hover:scale-105 duration-200"
                >
                  Create Channel
                </button>
              </div>
              <Modal isOpen={isOpen1} onClose={onClose1}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Create a Channel</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <div className="flex flex-col">
                      <div>
                        <p className="text-black font-semibold">
                          Receiver's Address
                        </p>
                        <input
                          className="w-full border border-black px-2 py-1 rounded-xl mt-2"
                          type="text"
                          placeholder="receiver's address"
                        ></input>
                      </div>
                      <div className="mt-5">
                        <p className="text-black font-semibold">
                          Channel Duration
                        </p>
                        <input
                          className="w-full border border-black px-2 py-1 rounded-xl mt-2"
                          type="number"
                          placeholder="minimum 7 days"
                        ></input>
                      </div>
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button colorScheme="red" mr={3} onClick={onClose1}>
                      Cancel
                    </Button>
                    <Button colorScheme="blue">Create</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </div>
          </div>
          <div className="mt-5">
            <Divider />
          </div>
          <div className="w-full flex flex-col justify-center mx-auto">
            <div className="w-full flex mx-auto">
              <div className="w-1/2 flex flex-col justify-start mr-5">
                <div className="w-full border-b border-gray-300  px-5 py-3 cursor-pointer mt-5">
                  <p className="text-black font-semibold justify-center text-center">
                    0x72D7968514E5e6659CeBB5CABa7E02CFf8eda389
                  </p>
                </div>
              </div>
              <div className="w-1/2 flex flex-col justify-end border border-indigo-500 ml-5 mt-5 rounded-xl">
                <div className="flex justify-center mx-auto text-center py-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sender;
