import style from "@/styles/common/solanaConnectBtn.module.sass";
import dynamic from "next/dynamic";
import {
  setAddress,
  setAccessToken,
  setProfile,
} from "@/redux/cyberConnectSlice";
import {
  updateAuthModal,
  updateCurrentAddress,
  updateLoginStatus,
} from "@/redux/globalSlice";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
require("@solana/wallet-adapter-react-ui/styles.css");

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const SolanaConnectBtn = () => {
  const wallet = useWallet();
  const dispatch = useDispatch();

  useEffect(() => {
    if (wallet.connected) {
      dispatch(updateLoginStatus(true));
      dispatch(setAddress(null));
      dispatch(setAccessToken(null));
      dispatch(setProfile(null));

      const address = wallet.publicKey?.toBase58()!;
      dispatch(updateCurrentAddress(address));
      dispatch(updateAuthModal(false));
    }
  }, [wallet]);

  return (
    <>
      {wallet.connected ? (
        <WalletMultiButtonDynamic />
      ) : (
        <div className={style.solanaConnectBtn}>
          <img className={style.icon} src="/phantom.png" alt="" />
          <div>Phantom</div>

          <div className={style.walletBtn}>
            <WalletMultiButtonDynamic />
          </div>
        </div>
      )}
    </>
  );
};

export default SolanaConnectBtn;
