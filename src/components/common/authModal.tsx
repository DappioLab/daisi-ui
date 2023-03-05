import API from "@/axios/api";
import { IUser } from "@/pages/profile/[address]";
import { IRootState } from "@/redux";
import { updateAuthModal, updateUserData } from "@/redux/globalSlice";
import style from "@/styles/common/authModal.module.sass";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetamaskConnectBtn from "./metamaskConnectBtn";
import SolanaConnectBtn from "./solanaConnectBtn";

export interface IAuthModal {
  showAuthModal: boolean;
  authData: IAuthData;
}

export interface IAuthData {
  address: string;
  // connectedType: EAuthWalletType | null;
  // connectedAddress: string | null;
}

// export enum EAuthWalletType {
//   SOLANA = "SOLANA",
//   BSC_TEST = "BSC_TEST",
// }

const AuthModal = () => {
  const { currentAddress } = useSelector((state: IRootState) => state.global);
  const dispatch = useDispatch();

  const closeModal = () => {
    dispatch(updateAuthModal(false));
  };

  useEffect(() => {
    if (!currentAddress) {
      return;
    }

    (async () => {
      const user: IUser = (await API.getUserByAddress(currentAddress)).data;

      if (!user) {
        await API.createUser({ address: currentAddress });
      } else {
        const data: IUser = {
          username: user.username,
          description: user.description,
          profilePicture: user.profilePicture,
          address: user.address,
          createdAt: user.createdAt,
          id: user.id,
          followers: user.followers,
          followings: user.followings,
        };
        dispatch(updateUserData(data));
      }
    })();
  }, [currentAddress]);

  return (
    <div className={style.authModal}>
      <div
        className={style.bg}
        onClick={() => {
          closeModal();
        }}
      ></div>
      <div className={style.modalContainer}>
        <div style={{ width: "fit-content", margin: "10rem auto" }}>
          <div>
            <MetamaskConnectBtn />
          </div>

          <br />
          <div>
            <SolanaConnectBtn />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
