import { AppProps } from "next/app";
import Sidebar from "@/components/common/sidebar";
import style from "@/styles/_app/index.module.sass";
import "@/styles/global/index.sass";
import { Provider } from "react-redux";
import store from "@/redux";
import Nav from "@/components/common/nav";

export default function App({ Component, pageProps }: AppProps) {
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
