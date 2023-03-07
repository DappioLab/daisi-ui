import style from "@/styles/common/nav.module.sass";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/redux";
import { updateAuthModal, updateLoginStatus } from "@/redux/globalSlice";
import { useWallet } from "@solana/wallet-adapter-react";

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
    dispatch(updateAuthModal(true));
  };

  return (
    <div className={style.nav}>
      <div
        className={style.nameBlock}
        onClick={() => {
          router.push("/");
        }}
      >
        <img className={style.logoBlock} src="/logo.svg" alt="" />
      </div>
      <div className={style.profile}>
        {!isLogin ? (
          <div
            className={style.tab}
            onClick={() => {
              showAuthModal();
            }}
          >
            Sign in
          </div>
        ) : (
          <div
            className={style.tab}
            onClick={() => {
              // router.push(`/profile/${userData?.address}`);
              router.push(`/profile?address=${userData?.address}`);
            }}
          >
            Profile
          </div>
        )}
        {/* <i
          className="fa fa-user"
          aria-hidden="true"
        ></i> */}
        {isLogin && userData ? (
          <div className={style.idBlock} onClick={() => showAuthModal()}>
            <span> {userData.address.substring(0, 6)}</span>
            <span>...</span>
            <span>{userData.address.slice(-6)}</span>
          </div>
        ) : null}
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
