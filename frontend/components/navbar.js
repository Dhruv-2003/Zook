import React from "react";
import { Web3Button } from "@web3modal/react";
import { useAccount } from "wagmi";
import Notifications from "./notifications";

export const Navbar = () => {
  const { isConnected } = useAccount();
  return (
    <div className="w-screen">
      <div className="mt-4 mx-10">
        <div className="flex justify-between align-middle">
          <div>
            <p className="text-indigo-500 font-bold text-4xl">ZOOK</p>
          </div>
          <div>{!isConnected ? <Web3Button /> : <Notifications />}</div>
        </div>
      </div>
    </div>
  );
};
