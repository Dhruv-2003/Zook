import React, { useEffect, useRef, useState } from "react";
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
import { Contract } from "ethers";
import { useAuth } from "../auth-context/auth";
import { getUserSafe } from "../components/safemethods";
import {
  encodePacked,
  hashMessage,
  parseEther,
  recoverAddress,
  recoverMessageAddress,
} from "viem";
import { EthersAdapter } from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import Safe, { SafeFactory } from "@safe-global/protocol-kit";
import SafeApiKit from "@safe-global/api-kit";
import { useRouter } from "next/router";
import EASService from "../components/eas";
import {
  ERC1155NFTRecepeint_Goerli,
  channelModule_Goerli,
} from "../constants/contracts";
import { ERC1155Recepient_ABI, Module_ABI } from "../constants/abi";
import { usePublicClient, useWalletClient } from "wagmi";

const Sender = () => {
  const {
    provider,
    setProvider,
    signer,
    setSigner,
    safeSdk,
    setSafeSDK,
    safeAddress,
    setSafeAddress,
    clientRef,
    peerAddress,
    setPeerAddress,
    xmtp_client,
  } = useAuth();

  const {
    isOpen: isOpen1,
    onOpen: onOpen1,
    onClose: onClose1,
  } = useDisclosure();

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (provider) {
      setIsLoggedIn(true);
      getUserTokenId();
    }
  }, [provider]);

  useEffect(() => {
    loadConversations();
  }, [xmtp_client]);

  const loadConversations = async () => {
    const allConversations = await xmtp_client.conversations.list();
    for (const conversation of allConversations) {
      const messagesInConversation = await conversation.messages();
      setIncomingMessages(messagesInConversation);
      console.log(messagesInConversation);
    }
    const messageLength = await incomingMessages.length;
    const lastmessage = incomingMessages[messageLength - 1].content;
    console.log(lastmessage);
    const lastmessage = incomingMessages[messageLength - 1].content;
    console.log(lastmessage);
  };

  function split() {
    const text = "";
    const partial = text.split(",");
    const partialmessage = partial[1].split(":");
    const safeAddressFromXmtp = partialmessage[1];
    const partialamount = partial[2].split(":");
    const owedAmountByXmtp = partialamount[1];
    console.log(safeAddressFromXmtp);
    console.log(owedAmountByXmtp);
  function split() {
    const text = "";
    const partial = text.split(",");
    const partialmessage = partial[1].split(":");
    const safeAddressFromXmtp = partialmessage[1];
    const partialamount = partial[2].split(":");
    const owedAmountByXmtp = partialamount[1];
    console.log(safeAddressFromXmtp);
    console.log(owedAmountByXmtp);
  }

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [safeSetupComplete, setsafeSetupComplete] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [channelDuration, setChannelDuration] = useState("");
  const [incomingMessages, setIncomingMessages] = useState();
  const [uid, setUid] = useState();
  const [url, setUrl] = useState();
  const [receiverAddress, setReceiverAddress] = useState();
  const [totalAmountOwed, setTotalAmountOwed] = useState();
  const [currAmount, setCurrAmount] = useState();

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

      // const safeAddress = await getUserSafe(signer);
      // console.log(safeAddress);
      // if (safeAddress) {
      //   const safeSDK = await Safe.create({ ethAdapter, safeAddress });

      //   // await enableModule(safeSDK,recoveryModuleContractAddress)
      //   setSafeSDK(safeSDK);
      //   setSafeAddress(safeAddress);
      //   setsafeSetupComplete(true);
      //   setisLoading(false);

      //   return;
      // }

      const safeAccountConfig = {
        owners,
        threshold,
      };
      console.log(safeAccountConfig);
      // / Will it have gas fees to deploy this safe tx
      const nonce = await provider.getTransactionCount(
        await signer.getAddress()
      );
      const safeSdk = await safeFactory.deploySafe({
        safeAccountConfig,
        saltNonce: nonce,
      });

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

      await enableModule(safeSdk);

      setisLoading(false);
      console.log(`created account : ${newSafeAddress}`);
      return newSafeAddress;
    } catch (error) {
      console.log(error);
    }
  };

  const enableModule = async (safesd) => {
    // createSafeWallet();
    console.log(safesd);
    const moduleAddress = "0x42f5d36cb22f7abb5b98ebe022aee15f2621a20e";
    const isEnabled = await safesd.isModuleEnabled(moduleAddress);

    if (!isEnabled) {
      const safeTransaction = await safesd.createEnableModuleTx(moduleAddress);
      const txResponse = await safesd.executeTransaction(safeTransaction);
      await txResponse.transactionResponse?.wait();

      console.log(txResponse);
      return true;
    } else {
      console.log("Module Already Enabled");
      return true;
    }
  };

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
    const Module_contract = new Contract(
      channelModule_Goerli,
      Module_ABI,
      provider
    );
    const senderAddress = await signer.getAddress();
    const tokenId = await Module_contract.senderTokenInfo(senderAddress);
    console.log(tokenId);

    /// maybe need to convert the Token ID
    return tokenId;
  };

  const createNewChannel = async (recepient, duration) => {
    // creates a New Safe for this wallet , Channel specific
    // enable Module
    const newSafeAddress = await createSafeWallet();

    // const newSafeAddress = safeAddress;
    console.log(newSafeAddress);
    if (newSafeAddress) {
      // Add record in the module
      const module_contract = new Contract(
        channelModule_Goerli,
        Module_ABI,
        signer
      );

      const tokenId = await getUserTokenId();

      const tx = await module_contract.createChannel(
        newSafeAddress,
        peerAddress,
        channelDuration,
        tokenId
      );

      await tx.wait();

      console.log(tx);

      // const newSafeAddress = "0x9B855D0Edb3111891a6A0059273904232c74815D";
      // send  a conversation to the recpient informing them regarding the channel creation , along with the safeAddress
      await sendMessage(
        `message:Here is our Safe Smart Contract wallet Address for the Channel:${newSafeAddress},safeAddress:${newSafeAddress},totalAmount:${0}`,
        peerAddress
      );
    } else {
      console.log("NO SAFE ADDR FOUND");
    }
    // }
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

  const sendMessage = async (message, receiverAddress) => {
    const xmtpClient = clientRef.current;
    const conversation = await xmtpClient.conversations.newConversation(
      receiverAddress
    );
    await conversation.send(message);
    console.log(conversation);
  };

  const getChannelId = async (safeAddress) => {
    const module_contract = new Contract(
      channelModule_Goerli,
      Module_ABI,
      signer
    );

    const channelId = await module_contract.channelAddressInfos(safeAddress);

    // maybe need to convert the Hex format to uint
    console.log(channelId);
    return channelId;
  };

  const payRecepientViaChannel = async () => {
    // / generate the Message to be signed
    const msg = generateSignMessage(safeAddress, totalAmount);

    /// sign the Message
    const signature = await walletClient.signMessage(msg);

    const conversation = await xmtp_client.conversations.newConversation(
      "0x9B855D0Edb3111891a6A0059273904232c74815D"
    );
    const messages = await conversation.messages();
    console.log(messages);

    const partial = messages.split(",");
    const partialmessage = partial[1].split(":");
    const safeAddressFromXmtp = partialmessage[1];
    const partialamount = partial[2].split(":");
    const owedAmountByXmtp = partialamount[1];

    await setReceiverAddress(safeAddressFromXmtp);

    // / create an attestation
    const eas = new EASService(provider, signer);
    const senderAdd = await signer.getAddress();
    const channelId = await getChannelId();
    const transAmount = parseEther(amount);
    const totalAmount = owedAmountByXmtp + transAmount;
    console.log(senderAdd);

    // const {senderAdd, receiverAdd, transAmount, safeAdd, channelID, totalAmount} = {senderAdd : "0x9B855D0Edb3111891a6A0059273904232c74815D",receiverAdd :"0x72D7968514E5e6659CeBB5CABa7E02CFf8eda389",safeAdd : "0x898d0DBd5850e086E6C09D2c83A26Bb5F1ff8C33",transAmount : 12, channelID : 20, totalAmount : 30}
    const { url, uid } = await eas.createOffChainAttestations(
      senderAdd,
      receiverAdd,
      transAmount,
      safeAddress,
      channelId,
      totalAmount
    );

    await setUid(uid);
    await setUrl(url);
    setTotalAmountOwed(totalAmount);
    await setUid(uid);
    await setUrl(url);
    setTotalAmountOwed(totalAmount);

    /// send an XMTP message along with signature itself
    await sendMessage(
      `message:${safeAddressFromXmtp},safeadd:${safeAddressFromXmtp},totalAmount:${totalAmount},easurl:${url},easuid:${uid},signature:${signature},currentAmount:${currAmount}`
    );
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
                <button onClick={addFundsToSafe} className="px-7 mx-5 py-1.5 rounded-xl bg-white text-indigo-500 border border-indigo-500 font-semibold hover:scale-105 duration-200">add funds</button>
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
                          onChange={(e) => setPeerAddress(e.target.value)}
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
                          onChange={(e) => setChannelDuration(e.target.value)}
                        ></input>
                      </div>
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button colorScheme="red" mr={3} onClick={onClose1}>
                      Cancel
                    </Button>
                    <Button onClick={createNewChannel} colorScheme="blue">
                      Create
                    </Button>
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
                <div className="flex flex-col mx-auto py-2 mt-3">
                  <div className="mx-3 flex flex-col justify-start">
                    <p className="text-indigo-500 text-xl font-semibold">
                      Receiver's Address
                    </p>
                    <p className="mt-3 font-semibold">{receiverAddress}</p>
                  </div>
                  <div className="mx-3 flex flex-col justify-start mt-3">
                    <p className="text-indigo-500 text-xl font-semibold">
                      Total Amount Owed
                    </p>
                    <p className="mt-3 font-semibold">{totalAmountOwed}</p>
                  </div>
                  <div className="mx-3 flex flex-col justify-start mt-3">
                    <p className="text-indigo-500 text-xl font-semibold">
                      EAS URL
                    </p>
                    <p className="mt-3 font-semibold">{url}</p>
                  </div>
                  <div className="mx-3 flex flex-col justify-start mt-3">
                    <p className="text-indigo-500 text-xl font-semibold">
                      EAS UID
                    </p>
                    <p className="mt-3 font-semibold">{uid}</p>
                  </div>
                  <div className="mt-4 flex justify-between w-full">
                  <input className="border boder-black px-4 py-1 rounded-xl" onChange={(e) => setCurrAmount(e.target.value)} placeholder="amount"></input>
                    <button className="px-7 mx-5 py-1.5 rounded-xl bg-white text-indigo-500 border border-indigo-500 font-semibold hover:scale-105 duration-200">
                        Pay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sender;
