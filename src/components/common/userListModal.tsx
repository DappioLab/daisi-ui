import API from "@/axios/api";
import axios from "axios";
import { IUser } from "@/pages/profile/[address]";
import { IRootState } from "@/redux";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "@/styles/common/userListModal.module.sass";
import { updateLoadingStatus, updateUserData } from "@/redux/globalSlice";
import { isAddress as isEvmAddress } from "ethers/lib/utils";
import {
  checkNetwork,
  connectWallet,
  createCyberConnectClient,
  fetchFollowers,
  fetchFollowings,
  follow,
} from "../cyberConnectPage/helper";

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
  const [userList, setUserList] = useState<IUser[]>([]);
  const dispatch = useDispatch();

  const updateUserFollowData = async (address: string) => {
    if (!userData) {
      alert("please login first");
      return;
    }

    if (!isEvmAddress(address)) {
      // Gum
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

    // if (props.userListType === EUserListType.FOLLOWERS) {
    //   await getFollowerUserList();
    // } else {
    //   await getFollowingUserList();
    // }
  };

  const getFollowingUserList = async () => {
    if (!userData) {
      alert("please login first");
      return;
    }

    props.setUserListType(EUserListType.FOLLOWINGS);
    dispatch(updateLoadingStatus(true));

    const users = (await API.getUsers()).data as IUser[];
    let followingUserList: IUser[] = [];
    if (!isEvmAddress(props.checkingUser.address)) {
      // Gum
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
    }

    setUserList(followingUserList);
    dispatch(updateLoadingStatus(false));
  };

  const getFollowerUserList = async () => {
    if (!userData) {
      alert("please login first");
      return;
    }

    props.setUserListType(EUserListType.FOLLOWERS);
    dispatch(updateLoadingStatus(true));

    const users = (await API.getUsers()).data as IUser[];
    let followerUserList: IUser[] = [];
    if (!isEvmAddress(props.checkingUser.address)) {
      // Gum
    } else {
      // CyberConnect
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

    setUserList(followerUserList);
    dispatch(updateLoadingStatus(false));
  };

  useEffect(() => {
    (async () => {
      if (props.userListType === EUserListType.FOLLOWERS) {
        await getFollowerUserList();
      } else {
        await getFollowingUserList();
      }
    })();
  }, [props.userListType, props.checkingUser]);

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
            onClick={() => getFollowingUserList()}
          >
            Followings
          </div>
          <div
            className={`${style.tab} ${
              props.userListType === EUserListType.FOLLOWERS &&
              style.selectedTab
            }`}
            onClick={() => getFollowerUserList()}
          >
            Followers
          </div>
        </div>
        <div>
          {userList.map((user) => {
            return (
              <div className={style.listItem} key={user.address}>
                <h3>{user.address}</h3>
                {userData?.address && userData.address !== user.address ? (
                  <div
                    className={style.followBtn}
                    onClick={() => updateUserFollowData(user.address)}
                  >
                    {user.followers.includes(userData.address)
                      ? "Following"
                      : "Follow"}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;
