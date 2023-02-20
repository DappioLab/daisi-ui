import style from "@/styles/common/nav.module.sass";
import { useRouter } from "next/router";

const Nav = () => {
  const router = useRouter();
  return (
    <div className={style.nav}>
      <h3
        onClick={() => {
          router.push("/");
        }}
      >
        Home
      </h3>
      <h3>Nav</h3>
      <h3>-</h3>
    </div>
  );
};

export default Nav;
