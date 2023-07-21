import { Web3Button } from "@web3modal/react";
import Notifications from "../components/notifications";
import { useAccount } from "wagmi";
import SafeAccountCreation from "../components/safeaccountcreation";

export default function Home() {
  const { isConnected } = useAccount();
  return (
    <div>
      <div className="">
        {!isConnected ? <Web3Button /> : <Notifications />}
      </div>
      <div>
        <SafeAccountCreation/>
      </div>
    </div>
  );
}
