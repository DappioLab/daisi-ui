import { IRootState } from "@/redux";
import {
  updateLoadingStatus,
  updateShowSubmitModal,
  updateSubmitModalData,
} from "@/redux/globalSlice";
import style from "@/styles/common/submitModal.module.sass";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDispatch, useSelector } from "react-redux";
import { ipfsClient, mainGateway } from "@/components/gumPage/storage";
import { useGumSDK } from "@/hooks/useGumSDK";
import { useMemo, useState } from "react";
import { Connection } from "@solana/web3.js";
import { GRAPHQL_ENDPOINTS } from "@/gpl-core/src";
import { useRouter } from "next/router";

export interface ISubmitModal {
  title: string;
  description: string;
  link: "";
}

export interface ISubmitModalProps {}

// export enum ESubmitModalTypes {
//   submitLink = "Submit link",
//   suggestNewSource = "Suggest new source",
// }

export enum EPostType {
  CYBER_CONNECT = "CYBER_CONNECT",
  GUM = "GUM",
}

const SubmitModal = (props: ISubmitModalProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const solanaWallet = useWallet();
  const { userData } = useSelector((state: IRootState) => state.global);
  const { provider } = useSelector((state: IRootState) => state.cyberConnect);
  const { userProfile } = useSelector((state: IRootState) => state.gum);
  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
  });

  const connection = useMemo(
    () =>
      new Connection(
        "https://lingering-holy-wind.solana-devnet.discover.quiknode.pro/169c1aa008961ed4ec13c040acd5037e8ead18b1/",
        "confirmed"
      ),
    []
  );
  const sdk = useGumSDK(
    connection,
    { preflightCommitment: "confirmed" },
    "devnet",
    GRAPHQL_ENDPOINTS.devnet
  );
  const CREATED_IN_DAISI_TAG = "Created in Daisi";

  const closeModal = () => {
    // const data: ISubmitModalProps = {
    //   title: "",
    //   description: "",
    //   showSubmitModal: false,
    // };

    dispatch(updateShowSubmitModal(false));
  };

  const createGumPost = async () => {
    let postId = "";
    let ipfsLink = "";

    try {
      let data: any = {
        daisiContent: {
          itemTitle: form.title,
          itemDescription: form.description,
          itemLink: form.link,
          itemImage: "https://picsum.photos/200/300",
          // "https://www.online-image-editor.com/styles/2019/images/power_girl_editor.png",
          created: new Date(),
        },
        content: {
          blocks: [
            {
              id: "0",
              type: "header",
              data: { text: CREATED_IN_DAISI_TAG, level: 0 },
            },
          ],
        },
        type: "blocks",
        authorship: {
          signature: "0",
          publicKey: "0",
        },
        contentDigest: "0",
        signatureEncoding: "base64",
        digestEncoding: "hex",
        parentDigest: "",
      };
      let uploadMetadata = await ipfsClient.add(JSON.stringify(data));
      console.log(uploadMetadata, "uploadMetadata");

      ipfsLink = mainGateway + uploadMetadata.path;
      if (solanaWallet.publicKey) {
        if (userProfile) {
          let postIx = await sdk?.post.create(
            ipfsLink,
            userProfile.profile,
            userProfile.user,
            solanaWallet.publicKey
          );

          if (postIx) {
            let result = await postIx.instructionMethodBuilder.rpc();
            console.log(result);
            postId = postIx.postPDA.toString();
          }
        }
        return { success: true, postId, postLink: ipfsLink };
      } else {
        alert("Wallet Not connected");
      }
    } catch (err) {
      console.log(err);
      return { success: false, postId, postLink: ipfsLink };
    }
  };

  const createCCPost = async () => {
    // form data
    let data = {
      itemTitle: form.title,
      itemDescription: form.description,
      itemLink: form.link,
      itemImage: "https://picsum.photos/200/300",
      created: new Date(),
    };
  };

  const createPost = () => {
    let type: EPostType | null = null;
    if (provider && !solanaWallet.connected) {
      type = EPostType.CYBER_CONNECT;
    }

    if (!provider && solanaWallet.connected) {
      type = EPostType.GUM;
    }

    if (!type) {
      alert("Connection error");
      return;
    }

    dispatch(updateLoadingStatus(true));

    switch (type) {
      case EPostType.CYBER_CONNECT:
        createCCPost();
        break;
      case EPostType.GUM:
        createGumPost();
        break;
      default:
        break;
    }

    setTimeout(() => {
      dispatch(updateShowSubmitModal(false));
      dispatch(updateLoadingStatus(false));
    }, 1500);
  };

  return (
    <div className={style.submitModal}>
      <div
        className={style.bg}
        onClick={() => {
          closeModal();
        }}
      ></div>
      <div className={style.modalContainer}>
        <div className={style.titleBlock}>
          <div>Post</div>
          {/* <div className={style.title}>{props.title}</div> */}
          <div
            className={style.closeBtn}
            onClick={() => {
              closeModal();
            }}
          >
            x
          </div>
        </div>
        {/* <div className={style.description}>{props.description}</div> */}
        <div className={style.formBlock}>
          <div className={style.inputBlock}>
            <div className={style.inputLabel}>Title</div>
            <input
              type="text"
              placeholder="title"
              className={style.input}
              value={form.title}
              onChange={(e) => {
                setForm((old) => {
                  old.title = e.target.value;
                  return JSON.parse(JSON.stringify(old));
                });
              }}
            />
          </div>
          <div className={style.inputBlock}>
            <div className={style.inputLabel}>Description</div>
            <textarea
              placeholder="description"
              className={style.input}
              value={form.description}
              onChange={(e) => {
                setForm((old) => {
                  old.description = e.target.value;
                  return JSON.parse(JSON.stringify(old));
                });
              }}
            ></textarea>
          </div>
          <div className={style.inputBlock}>
            <div className={style.inputLabel}>Link</div>
            <input
              type="text"
              placeholder="link"
              className={style.input}
              value={form.link}
              onChange={(e) => {
                setForm((old) => {
                  old.link = e.target.value;
                  return JSON.parse(JSON.stringify(old));
                });
              }}
            />
          </div>
          {/* <div className={style.inputBlock}>
            <div className={style.inputLabel}>Thumbnail Image</div>
            <input type="file" />
          </div> */}
        </div>

        <div className={style.bottomBlock}>
          {!solanaWallet.connected && !provider ? (
            <div className={style.operateBtn} style={{ pointerEvents: "none" }}>
              Please connect wallet first to send the link.
            </div>
          ) : (
            <div className={style.operateBtn} onClick={() => createPost()}>
              Submit
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitModal;
