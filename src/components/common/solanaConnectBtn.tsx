import { setAddress, setProvider } from "@/redux/cyberConnectSlice";
import { updateCurrentAddress, updateLoginStatus } from "@/redux/globalSlice";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { IAuthData } from "./authModal";
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
      const address = wallet.publicKey?.toBase58()!;

      dispatch(updateCurrentAddress(address));
      dispatch(setProvider(null));
      dispatch(setAddress(null));
      dispatch(updateLoginStatus(true));
    }
  }, [wallet]);

  return <WalletMultiButtonDynamic />;
};

export default SolanaConnectBtn;
