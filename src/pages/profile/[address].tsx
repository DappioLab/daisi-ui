import API from "@/axios/api";
import UserList, { EUserListType } from "@/components/common/userListModal";
import HorizontalFeed, {
  EFeedType,
} from "@/components/homePage/horizontalFeed";
import { IRootState } from "@/redux";
import { IApiRssListResponse, IParsedRssData } from "@/redux/dailySlice";
import { updateUserData } from "@/redux/globalSlice";
import style from "@/styles/profile/id.module.sass";
import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

export interface IUser {
  id: string;
  username: string;
  description: string;
  profilePicture: string;
  address: string;
  createdAt: string;
  followings: string[];
  followers: string[];
}

const Feed = ({ user }: { user: IUser }) => {
  const { userData } = useSelector((state: IRootState) => state.global);
  const [showUserList, setShowUserList] = useState(false);
  const [userListType, setUserListType] = useState<EUserListType | null>(null);
  const [userPosts, setUserPosts] = useState<IParsedRssData[]>([]);
  const [fetchedUser, setFetchedUser] = useState<IUser | null>(null);
  const router = useRouter();

  const updateUserFollowData = async () => {
    if (!userData?.id) {
      return;
    }

    await API.updateUserFollowData({ id: userData.id, targetId: user.id });
    router.push(router.asPath);
  };

  const getUserPosts = async () => {
    if (!user) {
      return;
    }
    const res: IApiRssListResponse[] = (await API.getUserPosts(user.id)).data;

    let parsedData: any = [];
    res.map((item) => {
      const obj = {
        ...item,
        source: {
          id: "",
          sourceTitle: "",
          sourceDescription: "",
          sourceLink: "",
          sourceIcon: "",
        },
      };

      parsedData.push(obj);
    });

    setUserPosts(parsedData);
  };

  const getUser = async () => {
    const address = router.query.address;

    if (!address) {
      return;
    }

    const user = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/user/${address}`
    );

    setFetchedUser(user.data);
  };

  useEffect(() => {
    getUser();
    getUserPosts();
  }, []);

  return (
    <div className={style.profileId}>
      {fetchedUser && user ? (
        <>
          <div className={style.userInfo}>
            <div className={style.avatar}>
              <img src="/avatar.jpeg" alt="avatar" />
            </div>
            <div className={style.userInfoBlock}>
              <div className={style.userName}>{fetchedUser.username}</div>
              <div className={style.userId}>
                <span>@{fetchedUser.address.substring(0, 6)}</span>
                <span>...</span>
                <span>{fetchedUser.address.slice(-6)}</span>
              </div>
              <div className={style.userBio}>
                {!fetchedUser.description ? "-" : fetchedUser.description}
              </div>
              <br />
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
              {userData?.id && userData.id !== fetchedUser.id ? (
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
              ) : null}
              {showUserList && (
                <UserList
                  setShowUserList={setShowUserList}
                  userListType={userListType}
                  setUserListType={setUserListType}
                />
              )}
            </div>
          </div>
          <div>
            {userPosts.map((item, index) => {
              return (
                <div key={`${index}`}>
                  <HorizontalFeed
                    article={item}
                    setShowModal={() => {}}
                    type={EFeedType.USER_POST}
                  />
                </div>
              );
            })}{" "}
          </div>
        </>
      ) : (
        <div>Loading</div>
      )}
    </div>
  );
};

export default Feed;

export async function getUserList() {
  const users = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/user/all`
  );

  return users.data.map((item: IUser) => {
    const obj = {
      params: {
        address: item.address,
      },
    };
    return obj;
  });
}

export async function getUserDetails(address: string) {
  let dataSet: any = {};
  const users = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/user/all`
  );

  if (users.data.length <= 0) {
    return dataSet;
  }

  for (let item of users.data) {
    const user = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/user/${item.address}`
    );
    dataSet[item.address] = user.data;
  }

  // @ts-ignore
  return dataSet[address];
}

export async function getStaticPaths() {
  const paths = await getUserList();
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: any) {
  let user = null;
  try {
    user = await getUserDetails(params.address);
  } catch (err) {}

  const notFound = user ? false : true;

  return {
    props: {
      user,
    },
    // revalidate: 1, // netlify minimum is 60
    notFound,
  };
}
