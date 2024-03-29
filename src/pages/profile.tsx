import moment from "moment";
import API from "@/axios/api";
import dynamic from "next/dynamic";
import style from "@/styles/profile/id.module.sass";
import useGum from "@/components/gum/useGum";
import HorizontalPostList from "@/components/homePage/horizontalPostList";
import useCyberConnect from "@/components/cyberConnect/useCyberConnect";
import CyberConnectFollowBtn from "@/components/cyberConnect/cyberConnectFollowBtn";
import UserProfileEdit from "@/components/common/userProfileEdit";
import GumFollowButton from "@/components/gum/gumFollowBtn";
import UserListModal, {
  EUserListType,
} from "@/components/common/userListModal";
import { IRootState } from "@/redux";
import { IPostList } from "@/redux/discoverSlice";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  EPostModalType,
  updateAuthModal,
  updateUserProfilePageData,
  updateUserProfilePageHandle,
} from "@/redux/globalSlice";
import {
  fetchFollowers,
  fetchFollowings,
  handleCreator,
} from "@/utils/cyberConnect";
import { setPostList } from "@/redux/cyberConnectSlice";
import { useGumSDK } from "@/hooks/useGumSDK";

const DataVerseDid = dynamic(
  () => import("../components/common/dataVerseDid"),
  { ssr: false }
);

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
  const {
    userProfile,
    followersMap,
    followingMap,
    postList: gumPostList,
  } = useSelector((state: IRootState) => state.persistedReducer.gum);

  const [showUserList, setShowUserList] = useState(false);
  const [userListType, setUserListType] = useState<EUserListType | null>(null);
  const [fetchedUser, setFetchedUser] = useState<IUser | null>(null);
  const {
    address: metamaskAddress,
    accessToken,
    postList: cyberConnectList,
  } = useSelector((state: IRootState) => state.persistedReducer.cyberConnect);
  const wallet = useWallet();
  const router = useRouter();
  const dispatch = useDispatch();
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [checkingAddress, setCheckingAddress] = useState("");
  const [isCheckingSolanaAddress, setIsCheckingSolanaAddress] = useState(false);
  let sdk = useGumSDK();

  const { address: myAddress } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );
  const [innerPostList, setInnerPostList] = useState<IPostList[]>([]);

  const { fetchPostData, parseComments } = useCyberConnect();
  const { fetchPostData: fetchGumPostData } = useGum();

  useEffect(() => {
    if (isCheckingSolanaAddress) {
      fetchGumPostData(checkingAddress);
    } else {
      (async () => {
        const list = await fetchPostData(checkingAddress);

        if (list) {
          setInnerPostList(list);
          dispatch(setPostList(list));
          parseComments(list);
        }
      })();
    }
  }, [checkingAddress, myAddress]);

  const getUser = async () => {
    if (!checkingAddress) {
      return;
    }

    const user = await API.getUserByAddress(checkingAddress);

    let followings: string[] = [];
    let followers: string[] = [];
    if (isCheckingSolanaAddress) {
      let gumAddress = new PublicKey(checkingAddress);

      if (isCheckingSolanaAddress) {
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
        followers = (
          await fetchFollowers(checkingAddress, currentAddress)
        )?.map((p) => p.owner.address);
        followers = followers ? followers : [];
        followings = (
          await fetchFollowings(checkingAddress, currentAddress)
        )?.map((p) => p.owner.address);
        followings = followings ? followings : [];
      }
    } else {
      const daisiHandle = handleCreator(checkingAddress);
      dispatch(updateUserProfilePageHandle(daisiHandle));
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
                          <br />
                          <DataVerseDid />
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
                    <>
                      <img
                        className={style.icon}
                        src="https://yt3.googleusercontent.com/9BS6z4-q-tUFIt3c-amgoNv0QRrEBIMG992Q1lmwsoJTxTmOK6uREjemm0ebe-18VbPOZzVFtw=s900-c-k-c0x00ffffff-no-rj"
                        alt="icon"
                      />
                      <img
                        className={style.icon}
                        src="https://dataverse-os.com/assets/logo-header.da3b67c6.svg"
                        alt=""
                      />
                    </>

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
            <>
              {gumPostList && gumPostList.length > 0 && (
                <HorizontalPostList
                  updateList={() => {}}
                  list={gumPostList}
                  position={EPostModalType.PROFILE_GUM}
                />
              )}
            </>
          ) : (
            <HorizontalPostList
              updateList={() => {}}
              list={innerPostList}
              position={EPostModalType.PROFILE_CC}
            />
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
