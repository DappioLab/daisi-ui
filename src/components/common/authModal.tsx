import API from "@/axios/api";
import style from "@/styles/common/authModal.module.sass";
import MetamaskConnectBtn from "./metamaskConnectBtn";
import SolanaConnectBtn from "./solanaConnectBtn";
import { useGumSDK } from "@/hooks/useGumSDK";
import { IUser } from "@/pages/profile";
import { IRootState } from "@/redux";
import { updateAuthModal, updateUserData } from "@/redux/globalSlice";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GRAPHQL_ENDPOINTS } from "@/gpl-core/src";
import { updateUserProfile } from "@/redux/gumSlice";
import {
  RuntimeConnector,
  Extension,
  METAMASK,
  CRYPTO_WALLET_TYPE,
} from "@dataverse/runtime-connector";

const runtimeConnector = new RuntimeConnector(Extension);

export interface IAuthModal {
  showAuthModal: boolean;
  authData: IAuthData;
}

export interface IAuthData {
  address: string;
  description: string;
  profilePicture: string;
}

const AuthModal = () => {
  const { currentAddress } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const { userProfile, userAccounts } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
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

  const createUserAccount = async () => {
    try {
      if (!solanaWallet.publicKey) {
        throw "wallet Not Connected";
      }
      let user = await sdk?.user.create(solanaWallet.publicKey);
      let result = await user?.instructionMethodBuilder.rpc();

      await fetchProfile();
      console.log(result);
    } catch (err) {}
  };

  const handleCreateProfile = async () => {
    try {
      if (!solanaWallet.publicKey) {
        throw "wallet Not Connected";
      }

      if (userAccounts.length > 0) {
        let result = await (
          await sdk?.profile.create(
            userAccounts[0],
            "Personal",
            solanaWallet.publicKey
          )
        )?.instructionMethodBuilder.rpc();
        console.log(result);
        await fetchProfile();
      }
      await fetchProfile();
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
    }
  };

  useEffect(() => {
    if (!currentAddress) {
      return;
    }

    (async () => {
      const user: IUser = (await API.getUserByAddress(currentAddress)).data;

      if (!user) {
        await API.createUser({
          address: currentAddress,
          profilePicture: "/logo.png",
          description: "This is a user profile description.",
        });
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

      if (res.length <= 0) {
        const account = await connection.getAccountInfo(solanaWallet.publicKey);
        console.log(account, "account");
        if (!account || account.lamports === 0) {
          alert("Please request some SOL from devnet to create your profile.");
          return;
        }

        createUserAccount();
      }
    })();
  }, [solanaWallet]);

  useEffect(() => {
    if (!solanaWallet.connected) {
      return;
    }

    if (userAccounts.length > 0 && userProfile === null) {
      handleCreateProfile();
    }
  }, [userAccounts, userProfile]);

  const [identity, setIdentity] = useState(null);

  const connectDataVerse = async () => {
    const did = await runtimeConnector.connectWallet({
      name: METAMASK,
      type: CRYPTO_WALLET_TYPE,
    });

    // await runtimeConnector.switchNetwork(80001);
    await runtimeConnector.switchNetwork(97);
    const identity = await runtimeConnector.connectIdentity({
      wallet: { name: METAMASK, type: CRYPTO_WALLET_TYPE },
      appName: "dapq001",
      modelNames: ["dapp001_post"],
    });
    setIdentity(identity);
  };

  useEffect(() => {
    connectDataVerse();
  }, []);

  return (
    <div className={style.authModal}>
      <div
        className={style.bg}
        onClick={() => {
          dispatch(updateAuthModal(false));
        }}
      ></div>
      <div className={style.modalContainer}>
        <div>
          <div className={style.signInBtn}>Sign In</div>
          <div>
            <MetamaskConnectBtn />
            <div className={style.note}>* Please switch to BSC testnet </div>
            {identity ? (
              <div className={style.note}>* Dataverse now is connected</div>
            ) : (
              <div className={style.note}>* Dataverse supported</div>
            )}
          </div>
          <br />
          <div>
            <SolanaConnectBtn />
            <div className={style.note}>* Please switch to Solana devnet</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
