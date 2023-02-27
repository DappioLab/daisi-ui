import { IRootState } from "@/redux";
import { useDispatch, useSelector } from "react-redux";
import {
  setProvider,
  setAddress,
  setAccessToken,
} from "@/redux/cyberConnectSlice";
import { connectWallet, checkNetwork } from "./helper/wallet";

const SigninBtn = () => {
  const { address } = useSelector((state: IRootState) => state.cyberConnect);
  const dispatch = useDispatch();

  const handleOnClick = async () => {
    try {
      console.log("connect to wallet");
      const provider = await connectWallet();
      await checkNetwork(provider);
      dispatch(setProvider(provider));

      /* Get the signer from the provider */
      const signer = provider.getSigner();

      /* Get the address of the connected wallet */
      const address = await signer.getAddress();
      dispatch(setAddress(address));

      console.log("provider:", provider);
      console.log("address:", address);

      /* Get the network from the provider */
      const network = await provider.getNetwork();

      /* Get the chain id from the network */

      /* Get the message from the server */
      // const messageResult = await loginGetMessage({
      //   variables: {
      //     input: {
      //       address: account,
      //       domain: "daisi.social",
      //     },
      //   },
      // });
      // const message = messageResult?.data?.loginGetMessage?.message;

      // /* Get the signature for the message signed with the wallet */
      // const signature = await signer.signMessage(message);

      // /* Verify the signature on the server and get the access token */
      // const accessTokenResult = await loginVerify({
      //   variables: {
      //     input: {
      //       address: account,
      //       domain: "daisi.social",
      //       signature: signature,
      //     },
      //   },
      // });
      // const accessToken = accessTokenResult?.data?.loginVerify?.accessToken;

      // /* Log the access token */
      // console.log("~~ Access token ~~");
      // console.log(accessToken);

      // /* Save the access token in local storage */
      // localStorage.setItem("accessToken", accessToken);

      // /* Set the access token in the state variable */
      // setAccessToken(accessToken);
    } catch (err) {}
  };

  return (
    <button onClick={handleOnClick}>
      {address ? address.slice(0, 4) + "..." + address.slice(-4) : "Sign in"}
    </button>
  );
};

export default SigninBtn;
