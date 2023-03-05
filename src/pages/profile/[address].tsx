import { IRootState } from "@/redux";
import style from "@/styles/profile/id.module.sass";
import axios from "axios";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";

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

export async function getUserList() {
  const users = await axios.get("http://localhost:8000/api/user/all");
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
  const users = await axios.get("http://localhost:8000/api/user/all");

  for (let item of users.data) {
    const user = await axios.get(
      `http://localhost:8000/api/user/${item.address}`
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
  const user = await getUserDetails(params.address);
  return {
    props: {
      user,
    },
    revalidate: 30,
  };
}

export default function Feed({ user }: { user: IUser }) {
  const { userData } = useSelector((state: IRootState) => state.global);

  const updateUserFollowData = async () => {
    if (!userData) {
      return;
    }

    const res = await axios.put(
      `http://localhost:8000/api/user/follow/${userData.id}`,
      { target_id: user.id }
    );

    window.location.reload();
  };

  return (
    <div className={style.profileId}>
      <div className={style.userInfo}>
        <div className={style.avatar}>
          <img src="/avatar.jpeg" alt="avatar" />
        </div>
        <div className={style.userInfoBlock}>
          <div className={style.userName}>{user.username}</div>
          <div className={style.userId}>
            <span>@{user.address.substring(0, 6)}</span>
            <span>...</span>
            <span>{user.address.slice(-6)}</span>
          </div>
          <div className={style.userBio}>
            {!user.description ? "-" : user.description}
          </div>
          <br />
          <div>Followings: {user.followings.length}</div>
          <div>Followers: {user.followers.length}</div>
          <div className={style.userJoinedDate}>
            Joined {moment(user.createdAt).format("MMMM DD,YYYY")}
          </div>
          <br />
          {userData && (
            <>
              {" "}
              {userData.id === user.id ? null : (
                <button onClick={() => updateUserFollowData()}>
                  {user.followers.includes(userData.id)
                    ? "Cancel follow"
                    : "Follow"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
