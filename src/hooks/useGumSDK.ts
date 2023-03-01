import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { useGum } from "@gumhq/react-sdk";
import { Cluster, ConfirmOptions, Connection } from "@solana/web3.js";
import { GraphQLClient } from "graphql-request";

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
