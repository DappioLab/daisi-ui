import { IRootState } from "@/redux";
import { useDispatch, useSelector } from "react-redux";
import {
  setAddress,
  setAccessToken,
  setProfile,
} from "@/redux/cyberConnectSlice";
import request from "graphql-request";
import { connectWallet, checkNetwork } from "../helper";
import {
  LOGIN_GET_MESSAGE_MUTATION,
  LOGIN_VERIFY_MUTATION,
} from "@/graphql/cyberConnect/mutation";
import { PROFILE_BY_ADDRESS_QUERY } from "@/graphql/cyberConnect/query";
import { CYBER_CONNECT_ENDPOINT } from "@/components/cyberConnectPage/constants";
const SigninBtn = () => {
  const { address } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );
  const dispatch = useDispatch();

  const handleOnClick = async () => {
    try {
      const provider = await connectWallet();
      await checkNetwork(provider);

      /* Get the signer from the provider */
      const signer = provider.getSigner();

      /* Get the address of the connected wallet */
      const address = await signer.getAddress();
      dispatch(setAddress(address));

      /* Get the network from the provider */
      const network = await provider.getNetwork();

      /* Get the message from the server */
      const messageResult = await request(
        CYBER_CONNECT_ENDPOINT,
        LOGIN_GET_MESSAGE_MUTATION,
        {
          address,
          domain: "daisi.social",
        }
      );
      // @ts-ignore
      const message = messageResult?.loginGetMessage?.message;

      /* Get the signature for the message signed with the wallet */
      const signature = await signer.signMessage(message);

      /* Verify the signature on the server and get the access token */
      const accessTokenResult = await request(
        CYBER_CONNECT_ENDPOINT,
        LOGIN_VERIFY_MUTATION,
        {
          address,
          domain: "daisi.social",
          signature: signature,
        }
      );

      // @ts-ignore
      const accessToken = accessTokenResult?.loginVerify?.accessToken;

      /* Set the access token in the state variable */
      dispatch(setAccessToken("bearer " + accessToken));

      const profile = await request(
        CYBER_CONNECT_ENDPOINT,
        PROFILE_BY_ADDRESS_QUERY,
        {
          address,
        }
      );

      // @ts-ignore
      const primaryProfile = profile?.address?.wallet?.primaryProfile;
      dispatch(setProfile(primaryProfile));
    } catch (err) {}
  };

  return (
    <button onClick={handleOnClick}>
      {address ? address.slice(0, 4) + "..." + address.slice(-4) : "Sign in"}
    </button>
  );
};

export default SigninBtn;
