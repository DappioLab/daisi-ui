import CyberConnect from "@cyberlab/cyberconnect-v2";
import { IRootState } from "@/redux";
import { useSelector } from "react-redux";
import { follow } from "./helper/follow";
import { handleCreator } from "./helper/profile";
import { useEffect, useState } from "react";
import request from "graphql-request";
import { CYBERCONNECT_ENDPOINT } from "./constants";
import { GET_FOLLOW_STATUS_QUERY } from "@/graphql/cyberConnect/query";
import style from "@/styles/cyberConnectPage/followButton.module.sass";

const FollowBtn = ({ address }: { address: string }) => {
  const { address: myAddress, cyberConnectClient } = useSelector(
    (state: IRootState) => state.cyberConnect
  );
  const [isFollowing, setFollowStatus] = useState(false);
  const daisiHandle = handleCreator(address);

  const handleOnClick = async (isFollow: boolean) => {
    await follow(daisiHandle, cyberConnectClient, isFollow);
    await fetchData();
  };

  const fetchData = async () => {
    try {
      if (!(cyberConnectClient && address && myAddress)) {
        return;
      }
      const res = await request(
        CYBERCONNECT_ENDPOINT,
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
  }, [address, myAddress]);

  return address != myAddress ? (
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
