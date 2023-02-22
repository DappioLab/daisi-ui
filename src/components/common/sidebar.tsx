import style from "@/styles/common/sidebar.module.sass";
import { useRouter } from "next/router";
import { useState } from "react";

const Sidebar = () => {
  const router = useRouter();
  const [routes, _] = useState([
    {
      label: "Daily",
      route: "/",
    },
    {
      label: "Gum",
      route: "/gum",
    },
    {
      label: "CyberConnect",
      route: "/cyber-connect",
    },
  ]);
  return (
    <div className={style.sidebar}>
      <div className={style.groupLabel}>Discover</div>
      {routes.map((item) => {
        return (
          <div
            className={`${style.label} ${
              router.asPath === item.route ? style.highlightRoute : ""
            }`}
            onClick={() => router.push(item.route)}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;
