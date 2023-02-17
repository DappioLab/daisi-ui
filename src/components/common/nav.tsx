import style from "@/styles/common/nav.module.sass";
import { useRouter } from "next/router";

const Nav = () => {
  const router = useRouter();
  return (
    <div className={style.nav}>
      <div
        onClick={() => {
          router.push("/");
        }}
      >
        Home
      </div>
      <div>Nav</div>
      <div>-</div>
    </div>
  );
};

export default Nav;
