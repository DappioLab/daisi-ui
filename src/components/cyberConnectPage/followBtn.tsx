import CyberConnect from "@cyberlab/cyberconnect-v2";
import { IRootState } from "@/redux";
import { useSelector } from "react-redux";
import {
  connectWallet,
  createCyberConnectClient,
  follow,
  handleCreator,
} from "./helper";
import { useEffect, useState } from "react";
import request from "graphql-request";
import { CYBER_CONNECT_ENDPOINT } from "./constants";
import { GET_FOLLOW_STATUS_QUERY } from "@/graphql/cyberConnect/query";
import style from "@/styles/cyberConnectPage/followButton.module.sass";

interface IFollowBtnProps {
  checkingAddress: string;
  getUser: () => Promise<void>;
}

const FollowBtn = (props: IFollowBtnProps) => {
  const { address: myAddress, accessToken } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );
  const [isFollowing, setFollowStatus] = useState(false);
  const daisiHandle = handleCreator(props.checkingAddress);

  const handleOnClick = async (isFollow: boolean) => {
    const provider = await connectWallet();
    const cyberConnectClient = createCyberConnectClient(provider);
    await follow(daisiHandle, cyberConnectClient, isFollow);
    await fetchData();
    await props.getUser();
  };

  const fetchData = async () => {
    try {
      if (!(accessToken && props.checkingAddress && myAddress)) {
        alert(
          `ERROR: some params are missing.\naccessToken: ${accessToken}\naddress: ${props.checkingAddress}\nmyAddress: ${myAddress}`
        );
        return;
      }
      const res = await request(
        CYBER_CONNECT_ENDPOINT,
        GET_FOLLOW_STATUS_QUERY,
        {
          handle: daisiHandle,
          myAddress,
        }
      );

      //@ts-ignore
      const isFollowByMe = res.profileByHandle.isFollowedByMe;
      setFollowStatus(isFollowByMe);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [props.checkingAddress, myAddress]);

  return props.checkingAddress != myAddress ? (
    <button
      className={style.followButton}
      onClick={() => handleOnClick(!isFollowing)}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  ) : (
    <></>
  );
};

export default FollowBtn;
