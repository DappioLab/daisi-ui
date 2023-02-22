import style from "@/styles/common/nav.module.sass";
import { useRouter } from "next/router";
import { useState } from "react";

const Nav = () => {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
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
    <div className={style.nav}>
      <div
        className={style.nameBlock}
        onClick={() => {
          router.push("/");
        }}
      >
        <div className={style.name}>DAISI</div>
        <div className={style.slogan}>Limits of awareness</div>
      </div>
      <div
        className={`${style.menuBtn}`}
        onClick={() => setShowMenu(!showMenu)}
      >
        X
      </div>
      <div className={`${style.menu} ${showMenu ? style.showMenu : ""}`}>
        {routes.map((item) => {
          return <div>{item.label}</div>;
        })}
      </div>
    </div>
  );
};

export default Nav;
