import { AppProps } from "next/app";
import "nprogress/nprogress.css";
import Sidebar from "@/components/common/sidebar";
import style from "@/styles/_app/index.module.sass";
import "@/styles/global/index.sass";
import { Provider } from "react-redux";
import store, { IRootState } from "@/redux";
import Nav from "@/components/common/nav";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import { useEffect } from "react";
import Head from "next/head";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useDispatch, useSelector } from "react-redux";

import React, { useMemo } from "react";
import Global from "@/components/common/global";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    router.events.on("routeChangeStart", () => {
      nProgress.start();
    });
    router.events.on("routeChangeComplete", () => nProgress.done());
    router.events.on("routeChangeError", () => nProgress.done());
  });

  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter({ network }),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <div className={style.appContainer}>
      <Provider store={store}>
        <Head>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
          ></link>
        </Head>
        <Nav />
        <div className={style.content}>
          <Sidebar />
          <div className={style.pageContent}>
            <ConnectionProvider endpoint={endpoint}>
              <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                  <Component {...pageProps} />
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>
          </div>
        </div>
        <Global />
      </Provider>
    </div>
  );
}
