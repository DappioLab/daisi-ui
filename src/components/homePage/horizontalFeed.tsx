import style from "@/styles/homePage/horizontalFeed.module.sass";
import moment from "moment";
import { useRouter } from "next/router";
import { ReactNode, useState } from "react";
import { IFeedProps } from "./gridFeed";

export enum EFeedType {
  USER_POST = "USER POST",
  RSS_ITEM = "RSS ITEM",
  CC_ITEM = "CC ITEM",
  GUM_ITEM = "GUM ITEM",
}

interface IHorizontalFeedProps extends IFeedProps {
  children: ReactNode;
}

const HorizontalFeed = (props: IHorizontalFeedProps) => {
  const router = useRouter();
  const [showLinkButton, setShowLinkButton] = useState(false);

  return (
    <div
      className={style.horizontalFeed}
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
      <div className={style.titleBlock}>
        <div className={style.title}>{props.item.itemTitle}</div>
        <div className={style.space}></div>
        <div className={style.timeBlock}>
          {moment(parseInt(props.item.linkCreated)).format("MMMM DD, YYYY")}
        </div>
        {/* Insert children */}
        <div className={style.socialActionBlock}>{props.children}</div>
      </div>
      <div className={style.itemImage}>
        <img
          src={
            props.item.itemImage && props.item.itemImage != ""
              ? props.item.itemImage
              : `https://picsum.photos/200/200?${Math.random()}`
          }
          alt="icon"
        />
      </div>
    </div>
  );
};

export default HorizontalFeed;
