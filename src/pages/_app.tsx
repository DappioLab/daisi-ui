import { AppProps } from "next/app";
import "nprogress/nprogress.css";
import Sidebar from "@/components/common/sidebar";
import style from "@/styles/_app/index.module.sass";
import "@/styles/global/index.sass";
import { Provider } from "react-redux";
import store from "@/redux";
import Nav from "@/components/common/nav";
import { useRouter } from "next/router";
import nProgress from "nprogress";
import { useEffect } from "react";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
    router.events.on("routeChangeStart", () => {
      nProgress.start();
    });
    router.events.on("routeChangeComplete", () => nProgress.done());
    router.events.on("routeChangeError", () => nProgress.done());
  });

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
            <Component {...pageProps} />
          </div>
        </div>
      </Provider>
    </div>
  );
}
