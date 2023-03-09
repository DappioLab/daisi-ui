import style from "@/styles/common/metamaskConnectBtn.module.sass";
import { IRootState } from "@/redux";
import { useDispatch, useSelector } from "react-redux";
import {
  setProvider,
  setAddress,
  setAccessToken,
  setProfile,
  setIpfsClient,
  setCyberConnectClient,
} from "@/redux/cyberConnectSlice";
import { Web3Provider, ExternalProvider } from "@ethersproject/providers";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

import {
  updateAuthModal,
  updateCurrentAddress,
  updateLoginStatus,
  updateUserProfilePageHandle,
} from "@/redux/globalSlice";
import { IAuthData } from "./authModal";
import { useWallet } from "@solana/wallet-adapter-react";
import { signin } from "../cyberConnectPage/helper/signin";
import {
  createCyberConnectClient,
  createIpfsClient,
} from "../cyberConnectPage/helper/clientFactory";
import {
  getProfileByAddress,
  createProfile,
  handleCreator,
  checkRelayActionStatus,
} from "../cyberConnectPage/helper/profile";

const MetamaskConnectBtn = () => {
  const solanaWallet = useWallet();
  const { address } = useSelector((state: IRootState) => state.cyberConnect);
  const dispatch = useDispatch();

  const connect = async () => {
    try {
      const provider = await connectWallet();
      await checkNetwork(provider);

      dispatch(setProvider(provider));
      dispatch(updateUserProfilePageHandle(null));

      const signer = provider.getSigner();
      const address = await signer.getAddress();
      dispatch(updateCurrentAddress(address));
      dispatch(setAddress(address));

      const accessToken = await signin(address, provider);
      dispatch(setAccessToken(accessToken));

      const ipfsClient = createIpfsClient();
      dispatch(setIpfsClient(ipfsClient));

      const cyberConnectClient = createCyberConnectClient(provider);
      dispatch(setCyberConnectClient(cyberConnectClient));

      const daisiHandle = handleCreator(address);
      const profile = await getProfileByAddress(address);

      if (!profile) {
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
        // TODO: Check handle is updated in Daisi DB
        // 1. fetch from DB
        // 2. Check
        // 3. if not, update to DB
      }

      solanaWallet.disconnect();
      dispatch(updateAuthModal(false));
      dispatch(updateLoginStatus(true));
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

const connectWallet = async () => {
  try {
    /* Function to detect most providers injected at window.ethereum */
    const detectedProvider =
      (await detectEthereumProvider()) as ExternalProvider;

    /* Check if the Ethereum provider exists */
    if (!detectedProvider) {
      throw new Error("Please install MetaMask!");
    }

    /* Ethers Web3Provider wraps the standard Web3 provider injected by MetaMask */
    const web3Provider = new ethers.providers.Web3Provider(detectedProvider);

    /* Connect to Ethereum. MetaMask will ask permission to connect user accounts */
    await web3Provider.send("eth_requestAccounts", []);

    return web3Provider;
  } catch (error) {
    /* Throw the error */
    throw error;
  }
};

const checkNetwork = async (provider: Web3Provider) => {
  try {
    /* Get the network from the provider */
    const network = await provider.getNetwork();

    console.log(process.env.NEXT_PUBLIC_CHAIN_ID);
    /* Check if the network is the correct one */
    if (network.chainId !== (Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 0)) {
      /* Switch network if the chain id doesn't correspond to Goerli Testnet Network */
      await provider.send("wallet_switchEthereumChain", [
        {
          chainId:
            "0x" + Number(process.env.NEXT_PUBLIC_CHAIN_ID)?.toString(16),
        },
      ]);

      /* Trigger a page reload */
      window.location.reload();
    }
  } catch (error: any) {
    /* This error code indicates that the chain has not been added to MetaMask */
    if (error.code === 4902) {
      await provider.send("wallet_addEthereumChain", [
        {
          chainId:
            "0x" + Number(process.env.NEXT_PUBLIC_CHAIN_ID)?.toString(16),
          rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
        },
      ]);

      /* Trigger a page reload */
      window.location.reload();
    } else {
      /* Throw the error */
      throw error;
    }
  }
};
