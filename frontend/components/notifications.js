import React, { useState, useRef, useEffect } from "react";
import { Client } from "@xmtp/xmtp-js";
import { ethers } from "ethers";
import { Web3Button } from "@web3modal/react";
import { useAuth } from "../auth-context/auth";

const Notifications = () => {
  const { setxmtp_client, xmtp_client,  convRef, clientRef, peerAddress } = useAuth();
  const [isOnNetwork, setIsOnNetwork] = useState(false);

  // useEffect(() => {
  //   if (isOnNetwork && convRef.current) {
  //     // Function to stream new messages in the conversation
  //     const streamMessages = async () => {
  //       const newStream = await convRef.current.streamMessages();
  //       for await (const msg of newStream) {
  //         const exists = messages.find((m) => m.id === msg.id);
  //         if (!exists) {
  //           setMessages((prevMessages) => {
  //             const msgsnew = [...prevMessages, msg];
  //             return msgsnew;
  //           });
  //         }
  //       }
  //     };
  //     streamMessages();
  //   }
  // }, [messages, isOnNetwork]);

  useEffect(() => {
    if (clientRef) {
      setIsOnNetwork(true);
    }
    if(!xmtp_client){
      initXmtp()
    }
  }, []);

  const sendMessage = async () => {
    const xmtpClient = clientRef.current;
    const conversation = await xmtpClient.conversations.newConversation(
      peerAddress
    );
    await conversation.send("new message");
    console.log(conversation);
  };

  const initXmtp = async function () {
    // Request access to the user's Ethereum accounts
    try {
      // Instantiate a new ethers provider with Metamask
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Get the signer from the ethers provider
      const signer = provider.getSigner();

      // Create the XMTP client
      const xmtp = await Client.create(signer, { env: "production" });
      //Create or load conversation with Gm bot
      if (await xmtp?.canMessage(peerAddress)) {
        const conversation = await xmtp.conversations.newConversation(
          peerAddress
        );
        convRef.current = conversation;
        console.log(convRef);
      } else {
        console.log("cant message because is not on the network.");
        //cant message because is not on the network.
      }
      // Set the XMTP client in state for later use
      setIsOnNetwork(!!xmtp.address);
      //Set the client in the ref
      clientRef.current = xmtp;
      setxmtp_client(xmtp);
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
      peerAddress
    );
    console.log(conversation);
    console.log(conversation.messages());
    convRef.current = conversation;
  };

  return (
    <div>
      {isOnNetwork != false ? (
        <>
          <Web3Button />
        </>
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
