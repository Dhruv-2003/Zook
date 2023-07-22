require("@nomicfoundation/hardhat-toolbox");

const CHAIDO_RPC = "https://rpc.chiadochain.net";
const GNOSIS_RPC = "https://rpc.gnosischain.com";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  defaultNetwork: gnosisMainnet,
  networks: {
    gnosisChaidoTestnet: {
      url: CHAIDO_RPC,
      gasPrice: 1000000000,
      accounts: [process.env.PRIVATE_KEY],
    },
    gnosisMainnet: {
      url: GNOSIS_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
