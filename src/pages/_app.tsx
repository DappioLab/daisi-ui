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

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
    router.events.on("routeChangeStart", (url) => {
      console.log(`Loading: ${url}`);
      nProgress.start();
    });
    router.events.on("routeChangeComplete", () => nProgress.done());
    router.events.on("routeChangeError", () => nProgress.done());
  });
  return (
    <div className={style.appContainer}>
      <Provider store={store}>
        <Nav />
        <div className={style.content}>
          <Sidebar />
          <Component {...pageProps} />;
        </div>
      </Provider>
    </div>
  );
}
