import { PublicKey } from "@solana/web3.js";
import { IRootState } from "@/redux/index";
import { useDispatch, useSelector } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import { SDK } from "@/gpl-core/src";
import { useGumSDK } from "@/hooks/useGumSDK";
import { ReactionInterface } from "./Explore";
interface likeButtonProp {
  toPost: string;
}
const LikeButton = (prop: likeButtonProp) => {
  const { userProfile, reactions } = useSelector(
    (state: IRootState) => state.gum
  );
  let toPost = new PublicKey(prop.toPost);
  let reactionsFromUser: ReactionInterface[] = [];
  let postReaction = reactions.get(toPost.toString());
  if (postReaction) {
    reactionsFromUser = postReaction.filter((reaction) => {
      if (userProfile) return reaction.from.equals(userProfile.profile);
    });
  }

  const createGumLike = async (post: string) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let likeTx = (
        await sdk?.reaction.create(
          userProfile.profile,
          new PublicKey(post),
          "Like",
          userProfile.user,
          wallet.publicKey
        )
      )?.instructionMethodBuilder.rpc();
    } catch (err) {
      console.log(err);
      return { success: false };
    }
    return { success: true };
  };
  const deleteLike = async (account: PublicKey) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let deleteLikeTx = (
        await sdk?.reaction.delete(
          account,
          toPost,
          userProfile.profile,
          userProfile.user,
          wallet.publicKey
        )
      )?.rpc();
    } catch (err) {
      console.log(err);
    }
  };
  const handleLike = async (e: any) => {
    try {
      let result = await createGumLike(toPost.toString());
    } catch (err) {
      console.log(err);
    }
  };
  const wallet = useWallet();
  const sdk = useGumSDK();

  let likeButton = null;
  let like = reactionsFromUser.find((reaction) => {
    return Object.keys(reaction.type).includes("like");
  });
  if (like) {
    likeButton = (
      <button
        className={""}
        onClick={() => {
          deleteLike(like.cl_pubkey);
        }}
      >
        revoke Like
      </button>
    );
  } else {
    likeButton = (
      <button className={""} onClick={handleLike}>
        Like
      </button>
    );
  }
  return <>{likeButton}</>;
};
export default LikeButton;
