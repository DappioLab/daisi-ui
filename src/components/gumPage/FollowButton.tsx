import style from "@/styles/gumPage/followButton.module.sass";
import { PublicKey } from "@solana/web3.js";
import { IRootState } from "@/redux/index";
import { useDispatch, useSelector } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import { SDK } from "@/gpl-core/src";
import { useGumSDK } from "@/hooks/useGumSDK";
interface followButtonProp {
  toProfile: PublicKey;
}
const FollowButton = (prop: followButtonProp) => {
  const { userProfile, following, followers, reactions } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );
  const wallet = useWallet();
  const sdk = useGumSDK();
  // const toProfile = new PublicKey(prop.toProfile);
  const toProfile = prop.toProfile;
  const createGunFollow = async (profile: string) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let followIx = await (
        await sdk?.connection.create(
          userProfile.profile,
          new PublicKey(profile),
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
  const handleFollow = async (e: any) => {
    try {
      let result = await createGunFollow(toProfile.toString());
    } catch (err) {
      console.log(err);
    }
  };
  const handleUnfollow = async (e: any) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let reactionPubkey = following.find((follow) => {
        return follow.follow.toString() == toProfile.toString();
      });
      let unFollowIx = await (
        await sdk?.connection.delete(
          reactionPubkey.cl_pubkey,
          userProfile.profile,
          new PublicKey(toProfile),
          userProfile.user,
          wallet.publicKey
        )
      )?.rpc();
    } catch (err) {
      console.log(err);
    }
  };
  let followButton = null;
  if (
    userProfile &&
    userProfile.profile.toString() != toProfile.toString() &&
    !following.find((conn) => {
      return conn.follow.equals(toProfile);
    })
  ) {
    followButton = (
      <button className={style.followButton} onClick={handleFollow}>
        Follow
      </button>
    );
  } else if (
    userProfile &&
    userProfile.profile.toString() != toProfile.toString() &&
    following.find((conn) => {
      return conn.follow.equals(toProfile);
    })
  ) {
    followButton = (
      <button className={style.followButton} onClick={handleUnfollow}>
        Following
      </button>
    );
  }
  return <> {followButton}</>;
};
export default FollowButton;
