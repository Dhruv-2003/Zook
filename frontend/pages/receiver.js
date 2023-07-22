import React, { useEffect, useRef, useState } from "react";
import { Divider } from "@chakra-ui/react";
import { useAuth } from "../auth-context/auth";

const Receiver = () => {
  const { xmtp_client, peerAddress } = useAuth();;
  const [isOnNetwork, setIsOnNetwork] = useState(false);
  const [incomingMessages, setIncomingMessages] = useState();
  const [receipt, setReceipt] = useState();
  const [showmore, setShowMore] = useState(false);

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
    const lastmessage = incomingMessages[messageLength - 1].content
    console.log(lastmessage)
  };

  function split(){
    const text = ""
    const partial = text.split(",")
    const partialmessage = partial[0].split(":")
    const safeAddressFromXmtp = partialmessage[2]
    const partialamount = partial[2].split(":")
    const owedAmountByXmtp = partialamount[1]
    console.log(safeAddressFromXmtp)
    console.log(owedAmountByXmtp)
  }

  return (
    <div className="w-screen">
      <div className="flex flex-col w-2/3 justify-center mx-auto mt-20">
        <div className="w-full">
          <div className="flex justify-between align-middle">
            <div>
              <p className="text-xl text-indigo-500 font-semibold">Channels</p>
            </div>
            <div></div>
          </div>
          <div className="mt-5">
            <Divider />
          </div>
          <div className="w-full flex mx-auto">
            <div className="w-1/2 flex flex-col justify-start mr-5">
              <div className="w-full border-b border-gray-300  px-5 py-3 cursor-pointer mt-5">
                <p className="text-black font-semibold justify-center text-center">
                  0x72D7968514E5e6659CeBB5CABa7E02CFf8eda389
                </p>
              </div>
              <div className="mt-5 flex flex-col justify-center">
                <button
                  onClick={() => setShowMore(true)}
                  className="border border-indigo-500 text-indigo-500 bg-white px-7 py-2 rounded-xl"
                >
                  Show All Transactions
                </button>
                <div className="mt-3">
                  {showmore ? (
                    <div className="w-full flex justify-end border border-indigo-500 rounded-xl">
                      <div className="flex flex-col justify-center mx-auto text-center py-2">
                        {incomingMessages &&
                          incomingMessages.map((message) => {
                            return (
                              <p className="text-lg text-black font-semibold mt-2">
                                {message.content}
                              </p>
                            );
                          })}
                      </div>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            </div>
            <div className="w-1/2 flex flex-col justify-end border border-indigo-500 ml-5 mt-5 rounded-xl">
              <div className="flex justify-center mx-auto text-center py-2"></div>
            </div>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default Receiver;
