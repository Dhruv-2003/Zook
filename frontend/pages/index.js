import { useRouter } from "next/router";
import { useAuth } from "../auth-context/auth";
import EASService from "../components/eas";
import SafeAccountCreation from "../components/safeaccountcreation";

export default function Home() {
  const router = useRouter();
  const { provider, signer } = useAuth();

  const createAttestations = async () => {
    try {
      if (!provider & !signer) {
        console.log("NO PROVIDER OR SIGNER");
        return;
      }
      console.log(signer, provider);
      const eas = new EASService(provider, signer);
      await eas.createOffChainAttestations(
        "0x72D7968514E5e6659CeBB5CABa7E02CFf8eda389",
        "0x9B855D0Edb3111891a6A0059273904232c74815D",
        10 ** 15,
        "0xb1d98F41b3a1885b7Daa59d318E78cEfDE13C3B5",
        0,
        10 ** 15
      );
      console.log(eas);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col">
      <div></div>
      <div className="mt-16 w-screen">
        <div className="flex justify-center mx-auto w-3/5">
          <p className="text-indigo-500 text-3xl font-semibold text-center">
            Payment Channel Solution enabling ZK-powered Yield-generating
            transactions
          </p>
        </div>
      </div>
      <div className="mt-20 w-screen">
        <div className="w-3/5 mx-auto flex flex-col">
          <div className="flex mx-auto">
            <p>lets start a payment channel</p>
          </div>
          <div className="flex justify-between mt-10">
            <div
              onClick={() => router.push("/sender")}
              className="border border-white bg-indigo-500 text-white hover:scale-105 hover:bg-white hover:border-indigo-500 hover:text-indigo-500 cursor-pointer duration-200 font-semibold w-full mr-5 rounded-xl"
            >
              <div className="flex flex-col mx-10">
                <p className="text-center mt-2 text-2xl">Sender</p>
                <p className="mt-4 text-center mb-4 text-lg">
                  Start a payment channel as a sender and send multiple
                  transactions to the reciever
                </p>
              </div>
            </div>
            <div
              onClick={() => router.push("/receiver")}
              className="border border-indigo-500 bg-white text-indigo-500 hover:scale-105 hover:bg-indigo-500 hover:border-white hover:text-white cursor-pointer duration-200 font-semibold w-full mr-5 rounded-xl"
            >
              <div className="flex flex-col mx-10">
                <p className="text-center mt-2 text-2xl">Reciever</p>
                <p className="mt-4 text-center mb-4 text-lg">
                  Start a payment channel as a Reciever and recieve multiple
                  transactions from the sender
                </p>
              </div>
            </div>
          </div>
          <div>
          </div>
        </div>
      </div>
    </div>
  );
}
