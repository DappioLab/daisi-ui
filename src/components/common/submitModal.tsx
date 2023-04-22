import { IRootState } from "@/redux";
import {
  updateEventNotificationQueue,
  updateLoadingStatus,
  updateShowSubmitModal,
  updateSubmitModalData,
} from "@/redux/globalSlice";
import style from "@/styles/common/submitModal.module.sass";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDispatch, useSelector } from "react-redux";
import { ipfsClient, mainGateway } from "@/components/gum/gumStorage";
import { useGumSDK } from "@/hooks/useGumSDK";
import { useEffect, useMemo, useState } from "react";
import { Connection } from "@solana/web3.js";
import { GRAPHQL_ENDPOINTS } from "@/gpl-core/src";
import { useRouter } from "next/router";
import {
  checkNetwork,
  connectWallet,
  createCyberConnectClient,
  createPost as createCyberConnectPost,
} from "@/utils/cyberConnect";
import { setLastPostsUpdateTime } from "@/redux/cyberConnectSlice";
import API from "@/axios/api";
export interface ISubmitModal {
  title: string;
  description: string;
  link: "";
}
import {
  RuntimeConnector,
  Apps,
  ModelNames,
  FileType,
  MirrorFile,
  Extension,
} from "@dataverse/runtime-connector";

const runtimeConnector = new RuntimeConnector(Extension);

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
  const { userData, eventNotificationQueue } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const [showGeneratingLoading, setShowGeneratingLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState(0);
  const [dots, detDots] = useState("");
  const { profile: ccProfile, accessToken } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );
  const { userProfile } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );
  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
    cover: "",
  });

  const sdk = useGumSDK();
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
          itemImage: form.cover,
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
            await postIx.instructionMethodBuilder.rpc();

            dispatch(updateShowSubmitModal(false));
            dispatch(updateLoadingStatus(false));
            updateEventQueue("Creating post");
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
    try {
      if (!(ccProfile && accessToken)) {
        alert("Please connect wallet before summit post.");
        return;
      }

      // form data
      let data = {
        itemTitle: form.title,
        itemDescription: form.description,
        itemLink: form.link,
        itemImage: form.cover,
        created: new Date(),
      };

      const provider = await connectWallet();
      await checkNetwork(provider);
      const cyberConnectClient = createCyberConnectClient(provider);

      dispatch(updateShowSubmitModal(false));
      dispatch(updateLoadingStatus(false));
      updateEventQueue("Creating post");
      const result = await createCyberConnectPost(
        data.itemTitle,
        data.itemDescription,
        data.itemLink,
        ccProfile.handle,
        cyberConnectClient,
        data.itemImage
      );
      dispatch(setLastPostsUpdateTime(new Date()));

      return {
        success: result.status == "SUCCESS" ? true : false,
        postId: result.contentId,
        postLink: result.metadataUrl,
      };
    } catch (err) {
      console.log(err);
      return { success: false, postId: "", postLink: "" };
    }
  };

  // Dataverse create stream
  const createStream = async () => {
    const did = await runtimeConnector.getCurrentDID();
    // form data
    let data = {
      itemTitle: form.title,
      itemDescription: form.description,
      itemLink: form.link,
      itemImage: form.cover,
      created: new Date(),
    };

    try {
      const currentTime = new Date();

      const { streamContent, streamId, newMirror, existingMirror } =
        await runtimeConnector.createStream({
          did,
          appName: "dapq001",
          modelName: "dapp001_post",
          streamContent: {
            appVersion: "0.1.0",
            text: JSON.stringify(data),
            createdAt: currentTime,
            updatedAt: currentTime,
          },
          fileType: FileType.Public,
        });
      console.log(streamContent);
    } catch (error) {
      console.log(error);
    }
  };

  const createPost = async () => {
    let type: EPostType | null = null;
    if (accessToken && !solanaWallet.connected) {
      type = EPostType.CYBER_CONNECT;
    }

    if (!accessToken && solanaWallet.connected) {
      type = EPostType.GUM;
    }

    if (!type) {
      alert("Connection error");
      return;
    }

    dispatch(updateLoadingStatus(true));

    let result = null;

    switch (type) {
      case EPostType.CYBER_CONNECT:
        result = await createCCPost();
        await createStream();

        break;
      case EPostType.GUM:
        result = await createGumPost();
        break;
      default:
        break;
    }

    if (result.success) {
      updateEventQueue(
        "Post created successfully, will redirect to profile page in 5 seconds."
      );
      setTimeout(() => {
        router.push(`/profile?address=${userData.address}`);
      }, 5000);
    } else {
      updateEventQueue(
        "Post created failed or not responding within 30 seconds due to the network issue, please check again"
      );
    }
  };

  const updateEventQueue = (event: string) => {
    const updatedQueue = [event, ...eventNotificationQueue];
    dispatch(updateEventNotificationQueue(updatedQueue));
  };

  const genDot = (num: number) => {
    if (num > 3) {
      setLoadingDots(0);
    } else {
      setLoadingDots(num);
    }
  };

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i > 3) {
        i = 0;
      }
      genDot(i);
    }, 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let str = "";
    for (let i = 0; i < loadingDots; i++) {
      str = str + ".";
    }
    detDots(str);
  }, [loadingDots]);

  useEffect(() => {
    (async () => {
      if (form.link) {
        setShowGeneratingLoading(true);
        const res = await API.getGeneratedContent(form.link);
        setForm((old) => {
          old.description = res.data.Summary;
          old.title = res.data.title;
          old.cover = res.data.cover;
          return JSON.parse(JSON.stringify(old));
        });
        setShowGeneratingLoading(false);
      }
    })();
  }, [form.link]);

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
          <div className={style.inputBlock}>
            {form.title != "" && <div className={style.inputLabel}>Title</div>}
            {form.title != "" && (
              <div className={style.input}>{form.title}</div>
            )}
            {/* <input
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
            /> */}
          </div>

          <div className={style.inputBlock}>
            {form.description != "" && (
              <div className={style.inputLabel}>Description</div>
            )}
            {form.description != "" && (
              <div className={style.input}>{form.description} </div>
            )}
            {/* <textarea
              style={{ height: "400px" }}
              placeholder="description"
              className={style.input}
              value={form.description}
              onChange={(e) => {
                setForm((old) => {
                  old.description = e.target.value;
                  return JSON.parse(JSON.stringify(old));
                });
              }}
            ></textarea> */}
          </div>
          {showGeneratingLoading && (
            <div className={style.loadingText}>Generating summary{dots}</div>
          )}
        </div>

        <div className={style.bottomBlock}>
          {!solanaWallet.connected && !accessToken ? (
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
