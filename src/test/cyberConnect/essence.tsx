import { useState } from "react";
import { IProfile } from "@/redux/cyberConnectSlice";

// This only stored on Arweave, didn't launch an Onchain event
// export interface Post {
//   arweaveTxHash: string;
//   author: string;
//   body: string;
//   createdAt: Date;
//   id: string;
//   title: string;
//   updatedAt: Date;
// }

// Issue EssenceNFT Onchain
// POST example: https://cyberconnect.mypinata.cloud/ipfs/Qmcyv4DFmR6HddENV14Z1u6CR5QqCYHW21xq3FTjXY7WC2
// SBT example: https://cyberconnect.mypinata.cloud/ipfs/Qmbif9zJfrGTXDmBVqL1MqWRpqGzk9fpWdtaybuMKVZ1Gs
export interface IFeed {
  essenceID: string;
  symbol: string;
  tokenURI: string;
  metadata: {
    metadata_id: string;
    app_id: string;
    lang: string;
    issue_date: Date;
    content: string;
    image: string;
    name: string;
    description: string;
  };
  createdBy: IProfile;
}

// Issue EssenceNFT Onchain
// WΞST (kind of SBT design by CyberConnect) example: https://metadata.stg.cyberconnect.dev/essence/17af129a402acbcf
// TODO: create interface

// Implement CyberConnect's EssenceNFT with symbol equal to POST for now,
// will add Arweave post soon.
const Feed = ({ feed }: { feed: IFeed }) => {
  // const [feedImage, setFeedImage] = useState(
  //   feed.metadata && feed.metadata.image
  //     ? feed.metadata.image
  //     : "/essence-placeholder.svg"
  // );
  // return (
  //   <div className={style.feed}>
  //     <div className={style.title}>{feed.createdBy.handle}</div>
  //     {feed.metadata && feed.metadata.content ? (
  //       <div className={style.content}>
  //         {feed.metadata && feed.metadata.content
  //           ? feed.metadata.content
  //           : "No content"}
  //       </div>
  //     ) : (
  //       <></>
  //     )}
  //     <img
  //       className={style.articleImage}
  //       src={feedImage}
  //       onError={() => setFeedImage("/essence-placeholder.svg")}
  //     ></img>
  //   </div>
  // );
};

export default Feed;
