import { AppProps } from "next/app";
import "nprogress/nprogress.css";
import Sidebar from "@/components/common/sidebar";
import style from "@/styles/_app/index.module.sass";
import "@/styles/global/index.sass";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { IRootState, store, persistor } from "@/redux";
import Nav from "@/components/common/nav";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import { useEffect, useState } from "react";
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
import { updateScreenWidth } from "@/redux/globalSlice";
import HeadMetadata from "@/components/common/headMetadata";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    router.events.on("routeChangeStart", () => {
      nProgress.start();
    });
    router.events.on("routeChangeComplete", () => nProgress.done());
    router.events.on("routeChangeError", () => nProgress.done());
  }, [router.pathname]);

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
        <PersistGate loading={null} persistor={persistor}>
          <HeadMetadata />
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <Global>
                  <Nav />
                  <div className={style.content}>
                    <Sidebar />
                    <div className={style.page}>
                      <Component {...pageProps} />
                    </div>
                  </div>
                </Global>
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </PersistGate>
      </Provider>
    </div>
  );
}
