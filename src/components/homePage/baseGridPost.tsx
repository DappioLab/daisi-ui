import style from "@/styles/homePage/baseGridPost.module.sass";
import moment from "moment";
import { ReactNode, useState } from "react";
import { useRouter } from "next/router";
import { IPostProps } from "@/pages";

interface IBaseGridPostProps extends IPostProps {
  children: ReactNode;
}

const BaseGridPost = (props: IBaseGridPostProps) => {
  const router = useRouter();
  const [showLinkButton, setShowLinkButton] = useState(false);

  return (
    <div
      className={style.baseGridPost}
      onMouseEnter={() => setShowLinkButton(true)}
      onMouseLeave={() => setShowLinkButton(false)}
    >
      <div
        className={style.articleIcon}
        onClick={(e) => {
          if (props.item.userAddress) {
            e.stopPropagation();
            router.push(`/profile?address=${props.item.userAddress}`);
          }
        }}
      >
        <img src={props.item.sourceIcon} alt="icon" />
      </div>
      {showLinkButton ? (
        <a href={props.item.itemLink} target="_blank">
          <div
            className={style.linkButton}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Read more <i className="fa fa-external-link" aria-hidden="true"></i>
          </div>
        </a>
      ) : null}

      <div className={style.title}>{props.item.itemTitle}</div>
      <div className={style.space}></div>
      <div className={style.timeBlock}>
        {moment(parseInt(props.item.linkCreated)).format("MMMM DD, YYYY")}{" "}
      </div>
      <div className={style.articleImage}>
        <img
          src={
            props.item.itemImage && props.item.itemImage != ""
              ? props.item.itemImage
              : `https://picsum.photos/200/300?${Math.random()}`
          }
          alt="icon"
        />
      </div>
      <div className={style.socialActionBlock}>{props.children}</div>
    </div>
  );
};

export default BaseGridPost;
