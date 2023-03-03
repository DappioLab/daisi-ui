import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { useGum } from "@gumhq/react-sdk";
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
  const sdk = useGum(anchorWallet, connection, opts, cluster, gpl);

  return sdk;
};
export const localGumSDK = (
  connection: Connection,
  opts: ConfirmOptions,
  cluster: Cluster,
  gplUrl: string
) => {
  const anchorWallet = useAnchorWallet() as AnchorWallet;
  let gpl = new GraphQLClient(gplUrl);
  let sdk = new LocalSDK(anchorWallet, connection, opts, cluster, gpl);
  return sdk;
};
