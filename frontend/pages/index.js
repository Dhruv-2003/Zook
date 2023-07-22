import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex flex-col">
      <div>
      </div>
      <div className="mt-16 w-screen">
        <div className="flex justify-center mx-auto">
          <p className="text-indigo-500 text-3xl font-semibold">
            Payment Channel Solution enabling ZK-powered gasless transactions
          </p>
        </div>
      </div>
      <div className="mt-20 w-screen">
        <div className="w-3/5 mx-auto flex flex-col">
          <div className="flex mx-auto">
            <p>lets start a payment channel</p>
          </div>
          <div className="flex justify-between mt-10">
            <div onClick={() => router.push("/sender")} className="border border-white bg-indigo-500 text-white hover:scale-105 hover:bg-white hover:border-indigo-500 hover:text-indigo-500 cursor-pointer duration-200 font-semibold w-full mr-5 rounded-xl">
              <div className="flex flex-col mx-10">
                <p className="text-center mt-2 text-2xl">Sender</p>
                <p className="mt-4 text-center mb-4 text-lg">Start a payment channel as a sender and send multiple transactions to the reciever</p>
              </div>
            </div>
            <div onClick={() => router.push("/receiver")} className="border border-indigo-500 bg-white text-indigo-500 hover:scale-105 hover:bg-indigo-500 hover:border-white hover:text-white cursor-pointer duration-200 font-semibold w-full mr-5 rounded-xl">
              <div className="flex flex-col mx-10">
                <p className="text-center mt-2 text-2xl">Reciever</p>
                <p className="mt-4 text-center mb-4 text-lg">Start a payment channel as a Reciever and recieve multiple transactions from the sender</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
