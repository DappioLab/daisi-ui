import API from "@/axios/api";
import { useGumSDK } from "@/hooks/useGumSDK";
import { IUser } from "@/pages/profile/[address]";
import { IRootState } from "@/redux";
import { updateAuthModal, updateUserData } from "@/redux/globalSlice";
import style from "@/styles/common/authModal.module.sass";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MetamaskConnectBtn from "./metamaskConnectBtn";
import SolanaConnectBtn from "./solanaConnectBtn";
import { GRAPHQL_ENDPOINTS } from "@/gpl-core/src";
import { updateUserAccounts, updateUserProfile } from "@/redux/gumSlice";

export interface IAuthModal {
  showAuthModal: boolean;
  authData: IAuthData;
}

export interface IAuthData {
  address: string;
}

const AuthModal = () => {
  const { currentAddress } = useSelector((state: IRootState) => state.global);
  const { userProfile, userAccounts } = useSelector(
    (state: IRootState) => state.gum
  );
  const dispatch = useDispatch();
  const solanaWallet = useWallet();
  const connection = useMemo(
    () =>
      new Connection(
        "https://lingering-holy-wind.solana-devnet.discover.quiknode.pro/169c1aa008961ed4ec13c040acd5037e8ead18b1/",
        "confirmed"
      ),
    []
  );
  const sdk = useGumSDK(
    connection,
    { preflightCommitment: "confirmed" },
    "devnet",
    GRAPHQL_ENDPOINTS.devnet
  );

  const handleCreateProfile = async () => {
    try {
      if (!solanaWallet.publicKey) {
        throw "wallet Not Connected";
      }

      if (userAccounts.length > 0) {
        console.log("creating profile");
        let result = await (
          await sdk?.profile.create(
            userAccounts[0],
            "Personal",
            solanaWallet.publicKey
          )
        )?.instructionMethodBuilder.rpc();
        console.log(result);
        // await fetchProfile();
      } else {
        console.log("creating user");

        let user = await sdk?.user.create(solanaWallet.publicKey);

        let result = await user?.instructionMethodBuilder.rpc();

        console.log(result);
        // await fetchProfile();
      }

      const res = await fetchProfile();
      dispatch(updateUserAccounts(res));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchProfile = async () => {
    if (solanaWallet.publicKey) {
      let profileKeys = await sdk?.profile.getProfileAccountsByUser(
        solanaWallet.publicKey
      );
      if (!userProfile && profileKeys && profileKeys.length > 0) {
        dispatch(
          updateUserProfile(
            profileKeys
              .map((pa) => {
                return {
                  profile: pa.publicKey,
                  user: pa.account.user,
                  wallet: solanaWallet.publicKey,
                };
              })
              .sort()[0]
          )
        );
      }
      let userKeys = await sdk?.user.getUserAccountsByUser(
        solanaWallet.publicKey
      );

      return userKeys.map((account) => {
        return account.publicKey;
      });
      // if (userKeys && userKeys.length > 0) {
      //   dispatch(
      //     updateUserAccounts(
      //       userKeys.map((account) => {
      //         return account.publicKey;
      //       })
      //     )
      //   );
      // }
    }
  };

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

  // Create gum profile
  useEffect(() => {
    if (!solanaWallet.connected) {
      return;
    }

    (async () => {
      const res = await fetchProfile();
      if (!res) {
        return;
      }

      if (res.length > 0) {
        updateUserAccounts(res);
      } else {
        handleCreateProfile();
      }
    })();
  }, [solanaWallet]);

  useEffect(() => {
    if (userAccounts.length < 0) {
      handleCreateProfile();
    }
  }, [userAccounts]);

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
