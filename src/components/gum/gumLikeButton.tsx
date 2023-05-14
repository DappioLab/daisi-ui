import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/redux";
import { updateAuthModal, updateLoadingStatus } from "@/redux/globalSlice";
import { PublicKey } from "@solana/web3.js";
import { ReactionType } from "@/gpl-core/src/reaction";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGumSDK } from "@/hooks/useGumSDK";
import { postInterface } from "./useGum";
import { updateReactions } from "@/redux/gumSlice";

interface IGumLikeButtonProps {
  post: postInterface;
  updateList: () => void;
}

const GumLikeButton = (props: IGumLikeButtonProps) => {
  const sdk = useGumSDK();
  const wallet = useWallet();
  const { userProfile, reactions } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );

  const dispatch = useDispatch();

  let reactionsFromUser: {
    from: PublicKey;
    type: ReactionType;
    cl_pubkey: PublicKey;
  }[] = [];

  const fetchReaction = async () => {
    let reactionAccounts = await sdk.reaction.getAllReactionAccounts();
    let map = new Map<
      string,
      { from: PublicKey; type: ReactionType; cl_pubkey: PublicKey }[]
    >();

    reactionAccounts.forEach((account) => {
      map.set(account.account.toPost.toString(), [
        {
          from: account.account.fromProfile,
          type: account.account.reactionType,
          cl_pubkey: account.publicKey,
        },
        ...(map.has(account.account.toPost.toString())
          ? map.get(account.account.toPost.toString())!
          : []),
      ]);
    });
    dispatch(updateReactions(map));
  };

  // TODO: Need to move this into functions
  if (reactions.size > 0) {
    let postReaction = reactions.get(props.post.cl_pubkey.toString());
    if (postReaction) {
      reactionsFromUser = postReaction.filter((reaction) => {
        if (userProfile)
          return reaction.from.toString() == userProfile.profile.toString();
      });
    }
  }

  const showLoginPrompt = () => {
    dispatch(updateAuthModal(true));
  };

  const createGumLike = async (post: string) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      await (
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

  const handleLike = async () => {
    try {
      dispatch(updateLoadingStatus(true));
      let result = await createGumLike(props.post.cl_pubkey.toString());
      dispatch(updateLoadingStatus(false));

      if (result.success) {
        console.log("success");
        fetchReaction();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteLike = async (account: PublicKey) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      (
        await sdk?.reaction.delete(
          account,
          props.post.cl_pubkey,
          userProfile.profile,
          userProfile.user,
          wallet.publicKey
        )
      )?.rpc();
    } catch (err) {
      console.log(err);
    }
  };

  let reactionButton = null;
  if (userProfile) {
    let likeButton = null;
    let like = reactionsFromUser.find((reaction) => {
      return Object.keys(reaction.type).includes("like");
    });

    if (like) {
      likeButton = (
        <div
          onClick={(e) => {
            e.stopPropagation();
            deleteLike(like.cl_pubkey);
          }}
        >
          <div style={{ fontSize: "1.6rem" }}>
            <i className="fa fa-heart" aria-hidden="true"></i>
          </div>{" "}
        </div>
      );
    } else {
      likeButton = (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
        >
          <div style={{ fontSize: "1.6rem" }}>
            <i className="fa fa-heart-o"></i>
          </div>
        </div>
      );
    }

    reactionButton = <>{likeButton}</>;
  }

  return (
    <>
      {userProfile ? (
        reactionButton
      ) : (
        <div
          style={{ fontSize: "1.6rem" }}
          onClick={(e) => {
            showLoginPrompt();
            e.stopPropagation();
          }}
        >
          <i className="fa fa-heart-o"></i>
        </div>
      )}
    </>
  );
};

export default GumLikeButton;
