import { Web3Provider, ExternalProvider } from "@ethersproject/providers";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

export const connectWallet = async () => {
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

export /* Function to check if the network is the correct one */
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
