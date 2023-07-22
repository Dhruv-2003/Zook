"use client";
import {
  SismoConnectButton,
  AuthType,
  SismoConnectResponse,
  ClaimType,
} from "@sismo-core/sismo-connect-react";

export default function SismoConnect() {
  return (
    <div>
      <SismoConnectButton
        config={{
          appId: "0x863d7d21fb487d5329386e8d080abec3", // replace with your appId
          vault: {
            // For development purposes insert the Data Sources that you want to impersonate here
            // Never use this in production
            impersonate: [
              // EVM
              "dhadrien.sismo.eth",
              "0xa4c94a6091545e40fc9c3e0982aec8942e282f38",
              // Github
              "github:dhadrien",
              // Twitter
              "twitter:dhadrien_",
              // Telegram
              "telegram:dhadrien",
            ],
          },
          // displayRawResponse: true,
        }}
        // request proof of Data Sources ownership (e.g EVM, GitHub, twitter or telegram)
        auths={[{ authType: AuthType.GITHUB }]}
        // request zk proof that Data Source are part of a group
        // (e.g NFT ownership, Dao Participation, GitHub commits)
        claims={[
          // ENS DAO Voters
          { groupId: "0x85c7ee90829de70d0d51f52336ea4722" },
          // Gitcoin passport with at least a score of 15
          {
            groupId: "0x1cde61966decb8600dfd0749bd371f12",
            value: 15,
            claimType: ClaimType.GTE,
          },
        ]}
        // request message signature from users.
        signature={{ message: "I vote Yes to Privacy" }}
        // retrieve the Sismo Connect Reponse from the user's Sismo data vault
        onResponse={async (response: SismoConnectResponse) => {
          const res = await fetch("/api/verify", {
            method: "POST",
            body: JSON.stringify(response),
          });
          console.log(await res.json());
        }}
        // reponse in bytes to call a contract
        // onResponseBytes={async (response: string) => {
        //   console.log(response);
        // }}
      />
    </div>
  );
}
