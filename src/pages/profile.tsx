import API from "@/axios/api";
import UserListModal, {
  EUserListType,
} from "@/components/common/userListModal";
import { IRootState } from "@/redux";
import { IApiRssListResponse, IParsedRssData } from "@/redux/dailySlice";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "@/styles/profile/id.module.sass";
import moment from "moment";
import HorizontalFeed, {
  EFeedType,
} from "@/components/homePage/horizontalFeed";
import { useWallet } from "@solana/wallet-adapter-react";
import ExplorePosts from "@/components/gum/gumPostList";
// import PostList from "@/components/cyberConnectPage/postListMigrated";
import PostList from "@/components/cyberConnect/cyberConnectPostList";
import CyberConnectFollowBtn from "@/components/cyberConnect/cyberConnectFollowBtn";
import { postInterface } from "@/utils/gum";
import UserProfileEdit from "@/components/common/userProfileEdit";
import GumFollowButton from "@/components/gum/gumFollowBtn";
import { PublicKey } from "@solana/web3.js";
import {
  updateAuthModal,
  updateUserProfilePageData,
  updateUserProfilePageHandle,
} from "@/redux/globalSlice";
import { fetchFollowers, fetchFollowings } from "@/utils/cyberConnect";
import { useGumSDK } from "@/hooks/useGumSDK";

export interface IUser {
  id: string;
  username: string;
  description: string;
  profilePicture: string;
  address: string;
  createdAt: string;
  followings: string[];
  followers: string[];
  profileHandle?: string; // Gum
}

const ProfilePage = ({ user }: { user: IUser }) => {
  const {
    userData,
    userProfilePageHandle,
    isLogin,
    userProfilePageData,
    currentAddress,
  } = useSelector((state: IRootState) => state.persistedReducer.global);
  const { userProfile, followersMap, followingMap } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );

  const [showUserList, setShowUserList] = useState(false);
  const [userListType, setUserListType] = useState<EUserListType | null>(null);
  // const [userPosts, setUserPosts] = useState<IParsedRssData[]>([]);
  const [fetchedUser, setFetchedUser] = useState<IUser | null>(null);
  const { address: metamaskAddress, accessToken } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );
  const wallet = useWallet();
  const router = useRouter();
  const dispatch = useDispatch();
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [checkingAddress, setCheckingAddress] = useState("");
  const [isCheckingSolanaAddress, setIsCheckingSolanaAddress] = useState(false);
  let sdk = useGumSDK();

  const getUser = async () => {
    if (!checkingAddress) {
      return;
    }

    const user = await API.getUserByAddress(checkingAddress);

    let followings: string[] = [];
    let followers: string[] = [];
    if (isCheckingSolanaAddress) {
      let gumAddress = new PublicKey(checkingAddress);

      let profile = (
        await sdk.profile.getProfilesByUser(gumAddress)
      )[0].cl_pubkey.toString();
      dispatch(updateUserProfilePageHandle(new PublicKey(profile)));

      if (followersMap.size && followersMap.size && profile) {
        let followProfiles = followersMap.get(profile);
        if (followProfiles)
          followers = followProfiles.map((acc) => {
            return acc.profile.toString();
          });
        let followerProfile = followingMap.get(profile);
        if (followerProfile)
          followings = followerProfile.map((acc) => {
            return acc.profile.toString();
          });
      }
    } else {
      followers = (await fetchFollowers(checkingAddress, currentAddress))?.map(
        (p) => p.owner.address
      );
      followers = followers ? followers : [];
      followings = (
        await fetchFollowings(checkingAddress, currentAddress)
      )?.map((p) => p.owner.address);
      followings = followings ? followings : [];
    }

    setFetchedUser({ ...user.data, followings, followers });
    dispatch(updateUserProfilePageData(user.data));
  };

  const showLoginPrompt = () => {
    dispatch(updateAuthModal(true));
  };

  useEffect(() => {
    (async () => {
      const address = router.asPath.split("address=")[1];
      setCheckingAddress(address);

      try {
        const value = PublicKey.isOnCurve(address);
        if (value) {
          setIsCheckingSolanaAddress(true);
        }
      } catch (err) {
        setIsCheckingSolanaAddress(false);
      }
    })();
  }, [router.asPath, metamaskAddress, userProfile]);

  useEffect(() => {
    getUser();
  }, [checkingAddress, followingMap]);

  let followButton = (
    <div className={style.followBtn} onClick={() => showLoginPrompt()}>
      Login{" "}
    </div>
  );

  if (accessToken && !isCheckingSolanaAddress) {
    followButton = (
      <CyberConnectFollowBtn
        checkingAddress={checkingAddress}
        getUser={getUser}
      />
    );
  } else if (userProfile && isCheckingSolanaAddress && wallet.connected) {
    followButton = <GumFollowButton toProfile={userProfilePageHandle} />;
  }

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
                {isLogin &&
                  userProfilePageData.address === userData.address && (
                    <div
                      className={style.editBtn}
                      onClick={() => setShowUserEditModal(true)}
                    >
                      <i className="fa fa-pencil" aria-hidden="true"></i>
                    </div>
                  )}
              </div>
              <div className={style.userId}>
                <span>@address - {fetchedUser.address.substring(0, 6)}</span>
                <span>...</span>
                <span>{fetchedUser.address.slice(-6)}</span>
              </div>
              {checkingAddress === userData.address && (
                <>
                  {userProfilePageHandle && (
                    <div className={style.userId}>
                      {wallet.connected && !accessToken ? (
                        <>
                          <span>
                            @handle -{" "}
                            {JSON.stringify(userProfilePageHandle).substring(
                              0,
                              6
                            )}
                          </span>
                          <span>...</span>
                          <span>
                            {JSON.stringify(userProfilePageHandle).slice(-6)}
                          </span>
                        </>
                      ) : null}
                      {accessToken && (
                        <>
                          <span>
                            @handle -{" "}
                            {userProfilePageHandle.toString().substring(0, 6)}
                          </span>
                          <span>...</span>
                          <span>
                            {userProfilePageHandle.toString().slice(-6)}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
              <div className={style.userBio}>
                <div>Bio</div>
                {!fetchedUser.description ? "-" : fetchedUser.description}
              </div>
              <br />

              <div className={style.followBtnBlock}>
                <div className={style.supportByBlock}>
                  <span>Supported by </span>
                  {isCheckingSolanaAddress ? (
                    <img
                      className={style.icon}
                      src="https://pbs.twimg.com/profile_images/1621492955868545024/CpsOM4M3_400x400.jpg"
                      alt="icon"
                    />
                  ) : (
                    <img
                      className={style.icon}
                      src="https://yt3.googleusercontent.com/9BS6z4-q-tUFIt3c-amgoNv0QRrEBIMG992Q1lmwsoJTxTmOK6uREjemm0ebe-18VbPOZzVFtw=s900-c-k-c0x00ffffff-no-rj"
                      alt="icon"
                    />
                    // <span>Cyber Connect</span>
                  )}
                </div>
                {followButton}
              </div>
              <div className={style.followDataBlock}>
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
              </div>
              <div className={style.userJoinedDate}>
                Joined {moment(fetchedUser.createdAt).format("MMMM DD, YYYY")}
              </div>
              {showUserList && (
                <UserListModal
                  checkingUser={fetchedUser}
                  userListType={userListType}
                  setShowUserList={setShowUserList}
                  setUserListType={setUserListType}
                  getUser={getUser}
                />
              )}
            </div>
          </div>
          {isCheckingSolanaAddress ? (
            <ExplorePosts checkingAddress={checkingAddress} />
          ) : (
            <PostList address={checkingAddress} />
          )}
        </>
      ) : null}
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
