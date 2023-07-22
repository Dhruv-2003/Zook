import {
  EAS,
  Offchain,
  SchemaEncoder,
  SchemaRegistry,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

// NOTE : We will be using Attestations for proving that there was the said transfer of the particular funds between those parties , inside the created channel
// The proof can be directly posted in form of the actual transaction details , like the sender , reciever , amount ,etc. we want to prove it for
// Or We could create some sort of ZK proofs which will be responsible for proving that the said address did some tx , without actually revealing all of the details , privacy scaling

// Choose the attestations on whatever chain you want to
const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26
const EASVersion = "0.26";
const CHAINID = 11155111;

const SchemaUID =
  "0x90d11fc17e957469d3d5a752c60d71f98a8ff98a153ff3e45025716cbd90d340";
const rawSchema =
  "address Sender,address Reciever,uint128 TxAmount,address SafeChannel ,uint16 ChannelID,uint128 TotalOwed";

const EAS_CONFIG = {
  address: EASContractAddress,
  version: EASVersion, // 0.26
  chainId: CHAINID,

};

class EASService {
  easClient;
  offChain;
  signer;

  constructor(provider, signer) {
    this.easClient = new EAS(EASContractAddress);
    this.offchain = new Offchain(EAS_CONFIG, 1);
    this.signer = signer;

    // Gets a default provider (in production use something else like infura/alchemy)
    // const provider = ethers.providers.getDefaultProvider("sepolia");s
    // const signer = provider.getSigners();

    this.easClient.connect(signer);
  }

  async getAttestationData(attestationUid) {
    // const attestationUid =
    //   "0x5134f511e0533f997e569dac711952dde21daf14b316f3cce23835defc82c065";

    const attestation = await this.easClient.getAttestation(attestationUid);

    console.log(attestation);
    // Contains all of these Data
    // {
    //     uid: '0x5134f511e0533f997e569dac711952dde21daf14b316f3cce23835defc82c065',
    //     schema: '0x27d06e3659317e9a4f8154d1e849eb53d43d91fb4f219884d1684f86d797804a',
    //     refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
    //     time: 1671219600,
    //     expirationTime: 0,
    //     revocationTime: 1671219636,
    //     recipient: '0xFD50b031E778fAb33DfD2Fc3Ca66a1EeF0652165',
    //     attester: '0x1e3de6aE412cA218FD2ae3379750388D414532dc',
    //     revocable: true,
    //     data: '0x0000000000000000000000000000000000000000000000000000000000000000'
    // }
  }

  async createOnChainsAttestations(
    sender,
    receiver,
    txAmount,
    safeAddress,
    channelId,
    totalOwed
  ) {
    /// define the Schema of the attestation to be createdt
    const schemaEncoder = new SchemaEncoder(rawSchema);
    const encodedData = schemaEncoder.encodeData([
      { name: "Sender", value: sender, type: "address" },
      { name: "Reciever", value: receiver, type: "address" },
      { name: "TxAmount", value: txAmount, type: "uint128" },
      { name: "SafeChannel", value: safeAddress, type: "address" },
      { name: "ChannelID", value: channelId, type: "uint16" },
      { name: "TotalOwed", value: totalOwed, type: "uint128" },
    ]); // the value of the encoded data can be chosen by the inputs we want it to be

    const address = await this.signer.getAddress();
    console.log(address)
    console.log(this.signer)
    console.log(this.easClient)

    const tx = await this.easClient.attest({
      schema: SchemaUID,
      data: {
        recipient: address,
        expirationTime: 0,
        revocable: true,
        data: encodedData,
      },
    });

    const newAttestationUID = await tx.wait();

    console.log("New attestation UID:", newAttestationUID);
  }

  async createOffChainAttestations(
    sender,
    receiver,
    txAmount,
    safeAddress,
    channelId,
    totalOwed
  ) {
    const timestamp = Math.floor(Date.now() / 1000);
    console.log(timestamp)
    const address = await this.signer.getAddress();
    const schemaEncoder = new SchemaEncoder(rawSchema);

    const encodedData = schemaEncoder.encodeData([
      { name: "Sender", value: sender, type: "address" },
      { name: "Reciever", value: receiver, type: "address" },
      { name: "TxAmount", value: txAmount, type: "uint128" },
      { name: "SafeChannel", value: safeAddress, type: "address" },
      { name: "ChannelID", value: channelId, type: "uint16" },
      { name: "TotalOwed", value: totalOwed, type: "uint128" },
    ]);
    console.log(encodedData)
    const offChainClient= new Offchain(EAS_CONFIG, 1);

    const offchainAttestation = await offChainClient.signOffchainAttestation(
      {
        recipient: address,
        // Unix timestamp of when attestation expires. (0 for no expiration)
        expirationTime: 0,
        // Unix timestamp of current time
        time: timestamp,
        revocable: true,
        nonce: 0,
        schema: SchemaUID,
        version: 1, 
        refUID:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        data: encodedData,
      },
      this.signer
    );
    console.log(offchainAttestation);

    // This function will return a signed off-chain attestation object containing the UID, signature, and other relevant information. You can then share this object with the intended recipient or store it for future use.s
  }
}

export default EASService