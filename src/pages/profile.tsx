import API from "@/axios/api";
import UserListModal, {
  EUserListType,
} from "@/components/common/userListModal";
import { IRootState } from "@/redux";
import { IApiRssListResponse, IParsedRssData } from "@/redux/dailySlice";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IUser } from "./profile/[address]";
import style from "@/styles/profile/id.module.sass";
import moment from "moment";
import HorizontalFeed, {
  EFeedType,
} from "@/components/homePage/horizontalFeed";
import { useWallet } from "@solana/wallet-adapter-react";
import ExplorePosts from "@/components/gumPage/ExploreMigrated";
import PostList from "@/components/cyberConnectPage/postListMigrated";
import FollowBtn from "@/components/cyberConnectPage/followBtn";
import { postInterface } from "@/utils/gum";
import UserProfileEdit from "@/components/common/userProfileEdit";

const ProfilePage = ({ user }: { user: IUser }) => {
  const { userData } = useSelector((state: IRootState) => state.global);
  const [showUserList, setShowUserList] = useState(false);
  const [userListType, setUserListType] = useState<EUserListType | null>(null);
  // const [userPosts, setUserPosts] = useState<IParsedRssData[]>([]);
  const [fetchedUser, setFetchedUser] = useState<IUser | null>(null);
  const { provider, address: metamaskAddress } = useSelector(
    (state: IRootState) => state.cyberConnect
  );
  const wallet = useWallet();
  const router = useRouter();

  const [showUserEditModal, setShowUserEditModal] = useState(false);

  // const updateUserFollowData = async () => {
  //   if (!userData?.id) {
  //     return;
  //   }

  //   await API.updateUserFollowData({ id: userData.id, targetId: user.id });
  //   router.push(router.asPath);
  // };

  const getUser = async () => {
    const address = router.asPath.split("address=")[1];

    if (!address) {
      return;
    }

    const user = await API.getUserByAddress(address);
    setFetchedUser(user.data);
  };

  useEffect(() => {
    console.log(router);
    (async () => {
      await getUser();
    })();
  }, []);

  return (
    <div className={style.profileId}>
      {fetchedUser ? (
        <>
          <div className={style.userInfo}>
            <div className={style.avatar}>
              <img src={fetchedUser.profilePicture} alt="avatar" />
            </div>
            <div className={style.userInfoBlock}>
              <div className={style.userNameRow}>
                <div>{fetchedUser.username}</div>
                <button
                  className={style.editBtn}
                  onClick={() => setShowUserEditModal(true)}
                >
                  Edit
                </button>
              </div>
              <div className={style.userId}>
                <span>@{fetchedUser.address.substring(0, 6)}</span>
                <span>...</span>
                <span>{fetchedUser.address.slice(-6)}</span>
              </div>
              <div className={style.userBio}>
                {!fetchedUser.description ? "-" : fetchedUser.description}
              </div>
              <br />
              {/* <div className={style.followDataBlock}>
                <div
                  onClick={() => {
                    setUserListType(EUserListType.FOLLOWINGS);
                    setShowUserList(true);
                  }}
                >
                  {fetchedUser.followings.length} Followings
                </div>
                <div
                  onClick={() => {
                    setUserListType(EUserListType.FOLLOWERS);
                    setShowUserList(true);
                  }}
                >
                  {fetchedUser.followers.length} Followers
                </div>
              </div> */}
              <div className={style.userJoinedDate}>
                Joined {moment(fetchedUser.createdAt).format("MMMM DD, YYYY")}
              </div>
              {/* Metamask follow btn */}
              {provider && (
                <div>
                  {metamaskAddress != router.asPath.split("address=")[1] && (
                    <div>
                      <FollowBtn address={router.asPath.split("address=")[1]} />
                    </div>
                  )}
                </div>
              )}
              {/* {userData?.id && userData.id !== fetchedUser.id ? (
                <div className={style.followBtnBlock}>
                  <div
                    className={style.followBtn}
                    onClick={() => updateUserFollowData()}
                  >
                    {fetchedUser.followers.includes(userData.id)
                      ? "Following"
                      : "Follow"}
                  </div>
                </div>
              ) : null} */}
              {showUserList && (
                <UserListModal
                  setShowUserList={setShowUserList}
                  userListType={userListType}
                  setUserListType={setUserListType}
                />
              )}
            </div>
          </div>
          {wallet.connected && (
            <div>
              <ExplorePosts />
            </div>
          )}
          {provider && (
            <PostList address={router.asPath.split("address=")[1]} />
          )}
        </>
      ) : (
        <div>User Not Exist</div>
      )}

      {showUserEditModal && (
        <UserProfileEdit
          user={JSON.parse(JSON.stringify(fetchedUser))}
          setShowUserEditModal={setShowUserEditModal}
          getUser={getUser}
        />
      )}
    </div>
  );
};

export default ProfilePage;
