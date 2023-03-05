import API from "@/axios/api";
import { IRootState } from "@/redux";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IUser } from "./profile/[address]";

const UserList = () => {
  const { userData } = useSelector((state: IRootState) => state.global);
  const [userList, setUserList] = useState<IUser[]>([]);

  const updateUserFollowData = async (target_id: string) => {
    if (!userData) {
      return;
    }

    const res = await axios.put(
      `http://localhost:8000/api/user/follow/${userData.id}`,
      { target_id }
    );
  };

  useEffect(() => {
    (async () => {
      const list = await API.getUsers();
      setUserList(list.data);
    })();
  });

  return (
    <div>
      <h1
        style={{
          margin: "3rem",
          padding: "2rem",
        }}
      >
        Current Role: {userData?.address}
      </h1>
      <div>
        {userList.map((user) => {
          return (
            <div
              style={{
                border: "solid 2px grey",
                margin: "3rem",
                padding: "2rem",
              }}
            >
              <h3>{user.address}</h3>
              <div>follower: {user.followers.length}</div>
              <div>following: {user.followings.length}</div>
              {userData && (
                <>
                  {" "}
                  {userData.id === user.id ? null : (
                    <button onClick={() => updateUserFollowData(user.id)}>
                      {user.followers.includes(userData.id)
                        ? "Cancel follow"
                        : "Follow"}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserList;
