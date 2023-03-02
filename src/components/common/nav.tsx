import style from "@/styles/common/nav.module.sass";
import { useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/redux";
import { IAuthModalProps } from "./authModal";
import { updateAuthModalData, updateLoginStatus } from "@/redux/globalSlice";

const Nav = () => {
  const { userData, isLogin } = useSelector(
    (state: IRootState) => state.global
  );
  const router = useRouter();
  const dispatch = useDispatch();
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

  const showAuthModal = () => {
    const data: IAuthModalProps = {
      showAuthModal: true,
    };
    dispatch(updateAuthModalData(data));
  };

  const logIn = () => {
    dispatch(updateLoginStatus(true));
  };

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
      <div className={style.profile}>
        <button onClick={() => logIn()}>log in</button>
        <i
          className="fa fa-user"
          aria-hidden="true"
          onClick={() => {
            if (!isLogin) {
              showAuthModal();
              return;
            }
            router.push(`/profile/${userData?.id}`);
          }}
        ></i>
      </div>
      <div
        className={`${style.menuBtn}`}
        onClick={() => setShowMenu(!showMenu)}
      >
        <div className={style.line}></div>
        <div className={style.line}></div>
        <div className={style.line}></div>
      </div>
      <div className={`${style.menu} ${showMenu ? style.showMenu : ""}`}>
        <div className={style.bg} onClick={() => setShowMenu(false)}></div>
        <div className={style.menuContainer}>
          <div
            className={style.closeMenuBtn}
            onClick={() => setShowMenu(false)}
          >
            x
          </div>
          {routes.map((item) => {
            return (
              <div
                onClick={() => {
                  router.push(item.route);
                }}
                key={item.label}
                className={`${style.label} ${
                  router.asPath === item.route ? style.highlightRoute : ""
                }`}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Nav;
