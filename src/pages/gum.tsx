import PageTitle from "@/components/common/pageTitle";
import style from "@/styles/gumPage/index.module.sass";
import dynamic from "next/dynamic";
import {
  AnchorWallet,
  useAnchorWallet,
  useWallet,
} from "@solana/wallet-adapter-react";
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

import React, { useMemo } from "react";
import ExplorePost from "../components/gumPage/Explore";
import useGumState from "@/components/gumPage/gumState";
// Use require instead of import since order matters
require("@solana/wallet-adapter-react-ui/styles.css");

const GumPage = () => {
  const wallet = useWallet();
  useGumState();
  return (
    <div className={style.gumPage}>
      <PageTitle title="Gum" />
      <div>
        <WalletMultiButtonDynamic />
      </div>
      <div>
        <ExplorePost />
      </div>
    </div>
  );
};

export default GumPage;
