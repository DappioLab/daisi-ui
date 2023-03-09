import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { Cluster, ConfirmOptions, Connection } from "@solana/web3.js";
import { GraphQLClient } from "graphql-request";

import { SDK as LocalSDK, GRAPHQL_ENDPOINTS } from "../gpl-core/src";
export const useGumSDK = (
  connection2 = connection,
  opts: ConfirmOptions = { preflightCommitment: "confirmed" },
  cluster: Cluster = "devnet",
  gplUrl: string = GRAPHQL_ENDPOINTS.devnet
) => {
  const anchorWallet = useAnchorWallet() as AnchorWallet;
  let gpl = new GraphQLClient(gplUrl);
  const sdk = new LocalSDK(anchorWallet, connection, opts, cluster, gpl);
  return sdk;
};
export const connection = new Connection(
  "https://lingering-holy-wind.solana-devnet.discover.quiknode.pro/169c1aa008961ed4ec13c040acd5037e8ead18b1/",
  "confirmed"
);
