import { IRootState } from "@/redux";
import { updateSubmitModalData } from "@/redux/globalSlice";
import style from "@/styles/common/sidebar.module.sass";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ESubmitModalTypes, ISubmitModalProps } from "./submitModal";

const Sidebar = () => {
  const router = useRouter();
  const [routes, _] = useState([
    {
      label: "Daily",
      route: "/",
    },
    // {
    //   label: "Gum",
    //   route: "/gum",
    // },
    // {
    //   label: "CyberConnect",
    //   route: "/cyber-connect",
    // },
  ]);
  const dispatch = useDispatch();

  const showSubmitModal = (type: string) => {
    let data: ISubmitModalProps = {
      title: "",
      description: "",
      showSubmitModal: true,
    };

    switch (type) {
      case ESubmitModalTypes.submitLink:
        data.title = "Submit Link";
        data.description =
          "Found an interesting post? Do you want to share it with the community? Enter the post's URL / link below to add it to the feed.";
        break;
      case ESubmitModalTypes.suggestNewSource:
        data.title = "Suggest New Source";
        data.description =
          "Have an idea for a new source? Insert its link below to add it to the feed.";
        break;
      default:
        break;
    }

    dispatch(updateSubmitModalData(data));
  };

  return (
    <div className={style.sidebar}>
      <div className={style.groupLabel}>Discover</div>
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
      <div className={style.groupLabel}>Contribute</div>
      <div
        className={`${style.label}`}
        onClick={() => showSubmitModal(ESubmitModalTypes.submitLink)}
      >
        Submit link
      </div>
      {/* <div
        className={`${style.label}`}
        onClick={() => showSubmitModal(ESubmitModalTypes.suggestNewSource)}
      >
        Suggest new source
      </div> */}
    </div>
  );
};

export default Sidebar;
