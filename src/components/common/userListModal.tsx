import API from "@/axios/api";
import style from "@/styles/common/userListModal.module.sass";
import FollowButton from "../gum/gumFollowBtn";
import { IUser } from "@/pages/profile";
import { IRootState } from "@/redux";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateLoadingStatus, updateUserData } from "@/redux/globalSlice";
import { isAddress as isEvmAddress } from "ethers/lib/utils";
import {
  checkNetwork,
  connectWallet,
  createCyberConnectClient,
  fetchFollowers,
  fetchFollowings,
  follow,
} from "@/utils/cyberConnect";
import { useGumSDK } from "@/hooks/useGumSDK";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/router";

export interface IUserListModalProps {
  checkingUser: IUser;
  userListType: EUserListType | null;
  setUserListType: Dispatch<SetStateAction<EUserListType | null>>;
  setShowUserList: Dispatch<SetStateAction<boolean>>;
  getUser: () => Promise<void>;
}

export enum EUserListType {
  "FOLLOWINGS" = "followings",
  "FOLLOWERS" = "followers",
}

const UserListModal = (props: IUserListModalProps) => {
  const { userData } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const { userProfile, followersMap, followingMap, allUser } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );
  const [userList, setUserList] = useState<IUser[]>([]);
  const [followingList, setFollowingList] = useState<IUser[]>([]);
  const [followerList, setFollowerList] = useState<IUser[]>([]);
  const dispatch = useDispatch();
  const router = useRouter();

  const updateUserFollowData = async (address: string) => {
    if (!userData) {
      alert("please login first");
      return;
    }

    if (!isEvmAddress(address)) {
    } else {
      // CyberConnect
      const provider = await connectWallet();
      await checkNetwork(provider);
      const cyberConnectClient = createCyberConnectClient(provider);
      const isFollowing = userData.followings.includes(address);

      await follow(address, cyberConnectClient, !isFollowing);

      // Update UserData
      const followers = (await fetchFollowers(userData.address)).map(
        (p) => p.owner.address
      );
      const followings = (await fetchFollowings(userData.address)).map(
        (p) => p.owner.address
      );
      dispatch(updateUserData({ ...userData, followers, followings }));
      await props.getUser();
    }
  };
  const sdk = useGumSDK();

  const getLists = async () => {
    if (!userData) {
      alert("please login first");
      return;
    }
    dispatch(updateLoadingStatus(true));
    let followingUserList: IUser[] = [];
    let followerUserList: IUser[] = [];

    const users = (await API.getUsers()).data as IUser[];
    if (!isEvmAddress(props.checkingUser.address)) {
      // Gum
      let profile = (
        await sdk.profile.getProfilesByUser(
          new PublicKey(props.checkingUser.address)
        )
      )[0]?.cl_pubkey.toString();
      {
        if (followersMap.size && profile) {
          let followerProfile = followersMap.get(profile);
          if (followerProfile) {
            followerProfile.forEach((address) => {
              let user = users.find((user) => {
                return user.address == address.wallet.toString();
              });
              if (user) {
                followerUserList.push({
                  ...user,
                  profileHandle: address.profile.toString(),
                });
              }
            });
          }
        }
      }
      {
        if (followingMap.size && profile) {
          let followingProfile = followingMap.get(profile);
          if (followingProfile) {
            followingProfile.forEach((address) => {
              let user = users.find((user) => {
                return user.address == address.wallet.toString();
              });
              if (user) {
                followingUserList.push({
                  ...user,
                  profileHandle: address.profile.toString(),
                });
              }
            });
          }
        }
        dispatch(updateLoadingStatus(false));
      }
    } else {
      // CyberConnect
      for (const address of props.checkingUser.followings) {
        const user = users.find((user) => user.address == address);
        if (user) {
          const followers = (
            await fetchFollowers(address, userData.address)
          ).map((p) => p.owner.address);
          const followings = (
            await fetchFollowings(address, userData.address)
          ).map((p) => p.owner.address);
          followingUserList.push({ ...user, followers, followings });
        }
      }
      for (const address of props.checkingUser.followers) {
        const user = users.find((user) => user.address == address);
        if (user) {
          const followers = (
            await fetchFollowers(address, userData.address)
          ).map((p) => p.owner.address);
          const followings = (
            await fetchFollowings(address, userData.address)
          ).map((p) => p.owner.address);
          followerUserList.push({ ...user, followers, followings });
        }
      }
    }

    setFollowerList(followerUserList);
    setFollowingList(followingUserList);
    dispatch(updateLoadingStatus(false));
  };

  const changeType = async (type: EUserListType) => {
    props.setUserListType(type);
  };
  useEffect(() => {
    getLists();
  }, [userProfile, props.checkingUser]);

  useEffect(() => {
    props.userListType == EUserListType.FOLLOWINGS
      ? setUserList(followingList)
      : setUserList(followerList);
  }, [followingList, followerList, props.userListType]);

  return (
    <div className={style.userListModal}>
      <div
        className={style.bg}
        onClick={() => props.setShowUserList(false)}
      ></div>
      <div className={style.modalContainer}>
        <div className={style.tabBlock}>
          <div
            className={`${style.tab} ${
              props.userListType === EUserListType.FOLLOWINGS &&
              style.selectedTab
            }`}
            onClick={() => changeType(EUserListType.FOLLOWINGS)}
          >
            Followings
          </div>
          <div
            className={`${style.tab} ${
              props.userListType === EUserListType.FOLLOWERS &&
              style.selectedTab
            }`}
            onClick={() => {
              changeType(EUserListType.FOLLOWERS);
            }}
          >
            Followers
          </div>
        </div>
        <div>
          {userList.map((user) => {
            return (
              <div className={style.listItem} key={user.address}>
                <div className={style.avatarRow}>
                  <img
                    onClick={() => {
                      router.push(`/profile/?address=${user.address}`);
                      props.setShowUserList(false);
                    }}
                    className={style.avatar}
                    src={user.profilePicture}
                    alt="avatar"
                  />
                  <div>
                    <h3>{user.address}</h3>
                    {userData?.address &&
                    userData.address !== user.address &&
                    !userProfile ? (
                      <div
                        className={style.followBtn}
                        onClick={() => updateUserFollowData(user.address)}
                      >
                        {user.followers.includes(userData.address)
                          ? "Following"
                          : "Follow"}
                      </div>
                    ) : null}
                    {userProfile && !isEvmAddress(user.address) ? (
                      <div>
                        <FollowButton
                          toProfile={new PublicKey(user.profileHandle)}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;
