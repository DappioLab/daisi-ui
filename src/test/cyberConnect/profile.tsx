import { PROFILE_BY_ADDRESS_QUERY } from "@/graphql/cyberConnect/query";
import { CYBER_CONNECT_ENDPOINT } from "@/utils/cyberConnect/constants";
import { IRootState } from "@/redux";
import request from "graphql-request";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CreateProfile from "./createProfile";
import FollowBtn from "@/components/cyberConnect/cyberConnectFollowBtn";

const Profile = () => {
  const { address, accessToken, profile } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );
  const [myProfiles, setMyProfiles] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      const profile = await request(
        CYBER_CONNECT_ENDPOINT,
        PROFILE_BY_ADDRESS_QUERY,
        {
          address,
        }
      );
      console.log(profile);
      setMyProfiles(
        // @ts-ignore
        profile?.address?.wallet?.profiles?.edges?.map((e: any) => e.node)
      );
    };

    fetchData();
  }, [address, accessToken, profile]);

  return (
    <div>
      {profile ? (
        <div>
          <h1>{profile.handle.slice(0, -3)}</h1>
          <h2>Wallet: {address}</h2>
          <h2> All my profiles:</h2>
          {myProfiles.map((p: any) => (
            <div>
              <h2>{p.handle.slice(0, -3)}</h2>
              <FollowBtn checkingAddress={address} getUser={async () => {}} />
              <FollowBtn checkingAddress={address} getUser={async () => {}} />
            </div>
          ))}
          <hr />
          <CreateProfile />
        </div>
      ) : (
        <CreateProfile />
      )}
    </div>
  );
};

export default Profile;
