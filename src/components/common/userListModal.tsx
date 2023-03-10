import API from "@/axios/api";
import axios from "axios";
import { IUser } from "@/pages/profile/[address]";
import { IRootState } from "@/redux";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "@/styles/common/userListModal.module.sass";
import { updateLoadingStatus } from "@/redux/globalSlice";

export interface IUserListModalProps {
  userListType: EUserListType | null;
  setUserListType: Dispatch<SetStateAction<EUserListType | null>>;
  setShowUserList: Dispatch<SetStateAction<boolean>>;
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

  const updateUserFollowData = async (targetId: string) => {
    if (!userData) {
      alert("please login first");
      return;
    }

    await API.updateUserFollowData({
      id: userData.id,
      targetId: targetId,
    });

    if (props.userListType === EUserListType.FOLLOWERS) {
      getFollowerUserList();
    } else {
      getFollowingUserList();
    }
  };

  const getFollowingUserList = async () => {
    if (!userData) {
      alert("please login first");
      return;
    }

    props.setUserListType(EUserListType.FOLLOWINGS);
    dispatch(updateLoadingStatus(true));
    const res = await API.getFollowingListByAddress(userData?.address);
    setUserList(res.data);
    dispatch(updateLoadingStatus(false));
  };

  const getFollowerUserList = async () => {
    if (!userData) {
      alert("please login first");
      return;
    }

    props.setUserListType(EUserListType.FOLLOWERS);
    dispatch(updateLoadingStatus(true));
    const res = await API.getFollowerListByAddress(userData?.address);
    setUserList(res.data);
    dispatch(updateLoadingStatus(false));
  };

  useEffect(() => {
    if (props.userListType === EUserListType.FOLLOWERS) {
      getFollowerUserList();
    } else {
      getFollowingUserList();
    }
  }, [props.userListType]);

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
                {userData?.id && userData.id !== user.id ? (
                  <div
                    className={style.followBtn}
                    onClick={() => updateUserFollowData(user.id)}
                  >
                    {user.followers.includes(userData.id)
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
