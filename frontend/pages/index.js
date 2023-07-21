import { Web3Button } from "@web3modal/react";
import Notifications from "../components/notifications";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();
  return (
    <div className="">{!isConnected ? <Web3Button /> : <Notifications />}</div>
  );
}
