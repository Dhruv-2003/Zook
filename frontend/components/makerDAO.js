import { Contract } from "ethers";
import { MakerDAOPool_ABI } from "../constants/abi";
import { useAuth } from "../auth-context/auth";
import { parseEther } from "viem";
const POOL_ADDRESS = "0x26ca51Af4506DE7a6f0785D20CD776081a05fF6d";

async function supplyAssets(amount) {
  const { signer, provider } = useAuth();
  const POOL_CONTRACT = new Contract(POOL_ADDRESS, MakerDAOPool_ABI, signer);
  const asset = "0x7D5afF7ab67b431cDFA6A94d50d3124cC4AB2611"; // WETH TOKEN , As The user generates yield for
  const formattedAmount = parseEther(amount);
  const tx = await POOL_CONTRACT.supply(asset, formattedAmount, "", 0);
  await tx.wait();
}

async function WithdrawAssets(amount, to) {
  const { signer, provider } = useAuth();
  const POOL_CONTRACT = new Contract(POOL_ADDRESS, MakerDAOPool_ABI, signer);
  const asset = "0x7D5afF7ab67b431cDFA6A94d50d3124cC4AB2611"; // WETH TOKEN , As The user generates yield for
  const formattedAmount = parseEther(amount);
  const tx = await POOL_CONTRACT.withdraw(asset, formattedAmount, to);
  await tx.wait();
}
