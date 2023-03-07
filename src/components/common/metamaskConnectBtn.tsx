import { IRootState } from "@/redux";
import { useDispatch, useSelector } from "react-redux";
import {
  setProvider,
  setAddress,
  setAccessToken,
  setPrimaryProfile,
} from "@/redux/cyberConnectSlice";
import request from "graphql-request";
import { Web3Provider, ExternalProvider } from "@ethersproject/providers";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

import {
  LOGIN_GET_MESSAGE_MUTATION,
  LOGIN_VERIFY_MUTATION,
} from "@/graphql/cyberConnect/mutation";
import {
  PROFILE_BY_ADDRESS_QUERY,
  cyberConnectEndpoint,
} from "@/graphql/cyberConnect/query";
import { updateCurrentAddress, updateLoginStatus } from "@/redux/globalSlice";
import { IAuthData } from "./authModal";
import { useWallet } from "@solana/wallet-adapter-react";

const MetamaskConnectBtn = () => {
  const solanaWallet = useWallet();
  const { address } = useSelector((state: IRootState) => state.cyberConnect);
  const dispatch = useDispatch();

  const connect = async () => {
    try {
      const provider = await connectWallet();
      await checkNetwork(provider);

      /* Get the signer from the provider */
      const signer = provider.getSigner();

      /* Get the address of the connected wallet */
      const address = await signer.getAddress();

      dispatch(setProvider(provider));
      dispatch(updateCurrentAddress(address));
      dispatch(setAddress(address));
      solanaWallet.disconnect();
      dispatch(updateLoginStatus(true));
    } catch (err) {}
  };

  // const handleOnClick = async () => {
  //   try {
  //     const provider = await connectWallet();
  //     await checkNetwork(provider);
  //     dispatch(setProvider(provider));

  //     /* Get the signer from the provider */
  //     const signer = provider.getSigner();

  //     /* Get the address of the connected wallet */
  //     const address = await signer.getAddress();
  //     dispatch(setAddress(address));

  //     /* Get the network from the provider */
  //     const network = await provider.getNetwork();

  //     /* Get the message from the server */
  //     const messageResult = await request(
  //       cyberConnectEndpoint,
  //       LOGIN_GET_MESSAGE_MUTATION,
  //       {
  //         address,
  //         domain: "daisi.social",
  //       }
  //     );
  //     // @ts-ignore
  //     const message = messageResult?.loginGetMessage?.message;

  //     /* Get the signature for the message signed with the wallet */
  //     const signature = await signer.signMessage(message);

  //     /* Verify the signature on the server and get the access token */
  //     const accessTokenResult = await request(
  //       cyberConnectEndpoint,
  //       LOGIN_VERIFY_MUTATION,
  //       {
  //         address,
  //         domain: "daisi.social",
  //         signature: signature,
  //       }
  //     );

  //     // @ts-ignore
  //     const accessToken = accessTokenResult?.loginVerify?.accessToken;

  //     /* Set the access token in the state variable */
  //     dispatch(setAccessToken("bearer " + accessToken));

  //     const profile = await request(
  //       cyberConnectEndpoint,
  //       PROFILE_BY_ADDRESS_QUERY,
  //       {
  //         address,
  //       }
  //     );

  //     // @ts-ignore
  //     const primaryProfile = profile?.address?.wallet?.primaryProfile;
  //     dispatch(setPrimaryProfile(primaryProfile));
  //   } catch (err) {}
  // };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "1rem",
        cursor: "pointer",
        border: "solid .1rem lightgrey",
      }}
      onClick={connect}
    >
      {address ? (
        address.slice(0, 4) + "..." + address.slice(-4)
      ) : (
        <img
          // style={{ width: "5rem", height: "5rem", marginRight: "2rem" }}
          src="https://raw.githubusercontent.com/MetaMask/brand-resources/c3c894bb8c460a2e9f47c07f6ef32e234190a7aa/SVG/metamask-fox-wordmark-horizontal.svg"
          alt=""
        />
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
          rpcUrls: ["https://goerli.infura.io/v3/"],
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
