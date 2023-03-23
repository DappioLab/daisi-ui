import { PublicKey } from "@solana/web3.js";
import { IRootState } from "@/redux/index";
import { useDispatch, useSelector } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import { SDK } from "@/gpl-core/src";
import { useGumSDK } from "@/hooks/useGumSDK";
import { ReactionInterface } from "./gumState";
interface deleteButtonProp {
  post: string;
  from: string;
  type: string;
}
const DeleteButton = (prop: deleteButtonProp) => {
  const wallet = useWallet();
  const { userProfile } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );
  const sdk = useGumSDK();
  const handleDelete = async (e: any) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let deleteTx = await sdk?.post
        .delete(
          new PublicKey(prop.post),
          new PublicKey(userProfile.profile),
          new PublicKey(userProfile.user),
          wallet.publicKey
        )
        ?.rpc();
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };
  let deleteButton = null;
  if (userProfile && userProfile.profile.toString() == prop.from) {
    deleteButton = (
      <div>
        <button className={""} onClick={handleDelete}>
          {"Delete " + prop.type}
        </button>
      </div>
    );
  }
  return <> {deleteButton}</>;
};

export default DeleteButton;
