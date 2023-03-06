import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";

import { Cluster, ConfirmOptions, Connection } from "@solana/web3.js";
import { GraphQLClient } from "graphql-request";

import { SDK as LocalSDK } from "../gpl-core/src";
export const useGumSDK = (
  connection: Connection,
  opts: ConfirmOptions,
  cluster: Cluster,
  gplUrl: string
) => {
  const anchorWallet = useAnchorWallet() as AnchorWallet;
  let gpl = new GraphQLClient(gplUrl);
  const sdk = new LocalSDK(anchorWallet, connection, opts, cluster, gpl);

  return sdk;
};
