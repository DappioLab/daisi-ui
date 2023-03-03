import { PROFILE_BY_ADDRESS_QUERY } from "@/graphql/cyberConnect/query";
import { cyberConnectEndpoint } from "@/graphql/cyberConnect/query";
import { IRootState } from "@/redux";
import request from "graphql-request";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CreateProfile from "./createProfile";

const Profile = () => {
  const { address, accessToken, primaryProfile } = useSelector(
    (state: IRootState) => state.cyberConnect
  );
  const [myProfiles, setMyProfiles] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      const profile = await request(
        cyberConnectEndpoint,
        PROFILE_BY_ADDRESS_QUERY,
        {
          address,
        }
      );
      console.log(profile);
      setMyProfiles(
        profile?.address?.wallet?.profiles?.edges?.map((e: any) => e.node)
      );
    };

    fetchData();
  }, [address, accessToken, primaryProfile]);

  return (
    <div>
      {primaryProfile ? (
        <div>
          <h1>{primaryProfile.handle.slice(0, -3)}</h1>
          <h2>Wallet: {address}</h2>
          <h2> All my profiles:</h2>
          {myProfiles.map((p: any) => (
            <h2>{p.handle.slice(0, -3)}</h2>
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
