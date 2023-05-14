import style from "@/styles/common/sidebar.module.sass";
import { updateShowSubmitModal } from "@/redux/globalSlice";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch } from "react-redux";

const Sidebar = () => {
  const router = useRouter();
  const [routes, _] = useState([
    {
      label: "Discover",
      route: "/",
    },
  ]);
  const dispatch = useDispatch();

  return (
    <div className={style.sidebar}>
      {routes.map((item) => {
        return (
          <div
            className={`${style.label} ${
              router.asPath === item.route ? style.highlightRoute : ""
            }`}
            key={item.route}
            onClick={() => router.push(item.route)}
          >
            {item.label}
          </div>
        );
      })}
      <div
        className={`${style.label}`}
        onClick={() => dispatch(updateShowSubmitModal(true))}
      >
        Post
      </div>
    </div>
  );
};

export default Sidebar;
