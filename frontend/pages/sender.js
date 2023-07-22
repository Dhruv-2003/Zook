import React, { useEffect, useRef } from "react";
import { Divider } from "@chakra-ui/react";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
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
import Chat from "../components/chat";
import { ethers } from "ethers";
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

const Sender = () => {
  const { safeSdk, signer, setSafeSDK, provider } = useAuth();
  const {
    isOpen: isOpen1,
    onOpen: onOpen1,
    onClose: onClose1,
  } = useDisclosure();
  const {
    isOpen: isOpen2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  const btnRef = React.useRef();

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
                <button
                  onClick={addFundsToSafe}
                  className="px-7 mx-5 py-1.5 rounded-xl bg-white text-indigo-500 border border-indigo-500 font-semibold hover:scale-105 duration-200"
                >
                  Add Funds
                </button>
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
          <div className="w-2/3 flex flex-col justify-center mx-auto">
            <div
              ref={btnRef}
              onClick={onOpen2}
              className="w-full border border-indigo-500 rounded-xl px-5 py-2 cursor-pointer mt-5"
            >
              <p className="text-black font-semibold justify-center text-center">
                0x72D7968514E5e6659CeBB5CABa7E02CFf8eda389
              </p>
            </div>
            <Drawer
              isOpen={isOpen2}
              placement="right"
              onClose={onClose2}
              finalFocusRef={btnRef}
            >
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>Channel Details</DrawerHeader>

                <DrawerBody></DrawerBody>

                <DrawerFooter>
                  <Button
                    variant="outline"
                    mr={3}
                    onClick={onClose2}
                    colorScheme="red"
                  >
                    Close
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sender;
