import React, { useState, useRef } from "react";
import { Client } from "@xmtp/xmtp-js";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

const Notifications = () => {
  const convRef = useRef(null);
  const clientRef = useRef(null);
  const PEER_ADDRESS = "0x9B855D0Edb3111891a6A0059273904232c74815D";
  const [messages, setMessages] = useState(null);
  const [isOnNetwork, setIsOnNetwork] = useState(false);

  const loadMessages = async () => {
    const messages = await convRef.messages();
    setMessages(messages);
    console.log(messages);
  };

  const sendMessage = async (message) => {
    await convRef.send(message);
  };

  const initXmtp = async function () {
    // Request access to the user's Ethereum accounts
    try {
      await window.ethereum.enable();

      // Instantiate a new ethers provider with Metamask
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Get the signer from the ethers provider
      const signer = provider.getSigner();

      // Create the XMTP client
      const xmtp = await Client.create(signer, { env: "production" });
      //Create or load conversation with Gm bot
      if (await xmtp?.canMessage(PEER_ADDRESS)) {
        const conversation = await xmtp.conversations.newConversation(
          PEER_ADDRESS
        );
        convRef.current = conversation;
      } else {
        console.log("cant message because is not on the network.");
        //cant message because is not on the network.
      }
      // Set the XMTP client in state for later use
      setIsOnNetwork(!!xmtp.address);
      //Set the client in the ref
      clientRef.current = xmtp;
    } catch (error) {
      console.log(error);
    }
  };

  const startAConversation = async function () {
    const xmtpClient = clientRef.current;
    if (!xmtpClient) {
      initXmtp();
    }
    const conversation = await xmtpClient.conversations.newConversation(
      PEER_ADDRESS
    );
    console.log(conversation);
    console.log(conversation.messages());
    convRef.current = conversation;
  };

  return (
    <div>
      {isOnNetwork != false ? (
        <div>hello</div>
      ) : (
        <button
          onClick={startAConversation}
          className="bg-blue-500 text-500 px-3 py-2 rounded-xl font-semibold text-white"
        >
          Connect to XMTP
        </button>
      )}
    </div>
  );
};

export default Notifications;
