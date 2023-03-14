import style from "@/styles/common/metamaskConnectBtn.module.sass";
import { IRootState } from "@/redux";
import { useDispatch, useSelector } from "react-redux";
import {
  setAddress,
  setAccessToken,
  setProfile,
} from "@/redux/cyberConnectSlice";

import {
  updateAuthModal,
  updateCurrentAddress,
  updateLoginStatus,
  updateUserProfilePageHandle,
} from "@/redux/globalSlice";
import { IAuthData } from "./authModal";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  signIn,
  createIpfsClient,
  getProfileByAddress,
  createProfile,
  handleCreator,
  checkNetwork,
  connectWallet,
  checkRelayActionStatus,
} from "../cyberConnectPage/helper";

const MetamaskConnectBtn = () => {
  const solanaWallet = useWallet();
  const { address } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );
  const dispatch = useDispatch();

  const connect = async () => {
    try {
      await solanaWallet.disconnect();
      // dispatch(updateUserProfilePageHandle(null));

      const provider = await connectWallet();
      await checkNetwork(provider);

      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const accessToken = await signIn(address, provider);
      dispatch(setAccessToken(accessToken));
      dispatch(setAddress(address));
      dispatch(updateLoginStatus(true));

      const daisiHandle = handleCreator(address);
      const profile = await getProfileByAddress(address);
      dispatch(updateCurrentAddress(address));

      if (!profile) {
        const ipfsClient = createIpfsClient();
        const { relayActionId } = await createProfile(
          daisiHandle,
          address,
          accessToken,
          ipfsClient
        );

        // TODO: Add auto detect relay action status and error handling if failed
        console.log("relayActionId:", relayActionId);
        const res = await checkRelayActionStatus(relayActionId);
        console.log("create profile result:", res);
      } else {
        dispatch(setProfile(profile));
      }

      dispatch(updateAuthModal(false));
    } catch (err) {}
  };

  return (
    <div onClick={connect} className={style.metamaskConnectBtn}>
      {address ? (
        <>
          <img
            style={{ width: "3rem", height: "3rem" }}
            src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg"
            alt=""
          />
          <span>{address.slice(0, 4) + "..." + address.slice(-4)}</span>
        </>
      ) : (
        <>
          <img
            style={{ width: "3rem", height: "3rem" }}
            src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg"
            alt=""
          />
          <span>Metamask</span>
        </>
      )}
    </div>
  );
};

export default MetamaskConnectBtn;
