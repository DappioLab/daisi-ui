import { IFeed } from "@/components/homePage/feed";
import { SDK } from "@gumhq/sdk";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";

interface PostAccount {
  cl_pubkey: string;
  metadatauri: string;
  profile: string;
}
interface ConnectionAccount {
  fromprofile: string;
  toprofile: string;
}
export interface ProfileAccount {
  accountKey: PublicKey;
  userKey: PublicKey;
}
export interface postInterface {
  metadatauri: string;
  cl_pubkey: string;
  content: { blocks: BlockInterface[] };
  type: string;
  title: string;
  description: string;
  image_url: string;
  profile: string;
}

export interface BlockInterface {
  id: string;
  type: string;
  data: {
    text?: string;
    level?: string;
    file?: { url: string };
    style: string;
  };
}

export const fetchPostData = async (wallet: WalletContextState, sdk: SDK) => {
  const mainGateway = "https://wei1769.infura-ipfs.io/ipfs/";

  try {
    if (wallet.publicKey) {
      const allPostAccounts =
        (await sdk?.post.getAllPosts()) as Array<PostAccount>;

      const userPosts = await sdk?.post.getPostAccountsByUser(wallet.publicKey);
      let userPostAccounts = userPosts
        ? await Promise.all(
            userPosts.map(async (post) => {
              try {
                if (post.account.metadataUri.includes("/ipfs/")) {
                  let postData = await axios.get(
                    mainGateway +
                      post.account.metadataUri.substring(
                        post.account.metadataUri.indexOf("/ipfs/") + 6
                      )
                  );
                  return {
                    postData,
                    metadatauri: post.account.metadataUri,
                    cl_pubkey: post.publicKey.toString(),
                    profile: post.account.profile.toString(),
                  };
                }
                let postData = await axios.get(post.account.metadataUri);
                return {
                  postData,
                  metadatauri: post.account.metadataUri,
                  cl_pubkey: post.publicKey.toString(),
                  profile: post?.account.profile.toString(),
                };
              } catch (err) {
                console.log(err);
              }
            })
          )
        : [];

      console.log(allPostAccounts, "allPostAccounts");

      let allPostsMetadata = await Promise.all(
        allPostAccounts
          .filter((post) => {
            return !userPostAccounts.find((userPost) => {
              return post.cl_pubkey == userPost?.cl_pubkey;
            });
          })
          .map(async (post) => {
            try {
              if (post.metadatauri.includes("/ipfs/")) {
                let postData = await axios.get(
                  mainGateway +
                    post.metadatauri.substring(
                      post.metadatauri.indexOf("/ipfs/") + 6
                    )
                );
                return {
                  postData,
                  metadatauri: post.metadatauri,
                  cl_pubkey: post.cl_pubkey,
                  profile: post.profile,
                };
              }

              let postData = await axios.get(post.metadatauri);

              return {
                postData,
                metadatauri: post.metadatauri,
                cl_pubkey: post.cl_pubkey,
                profile: post.profile,
              };
            } catch (err) {}
          })
      );

      console.log(
        [...userPostAccounts, ...allPostsMetadata],
        "[...userPostAccounts, ...allPostsMetadata]"
      );

      return [...userPostAccounts, ...allPostsMetadata]
        .filter((data) => {
          let postContext = data?.postData.data as postInterface;
          return (
            data?.postData.status == 200 &&
            postContext.content.blocks?.find((block) => {
              return (
                block.type == "header" && block.data.text == "Created in Daisi"
              );
            })
          );
        })
        .map((data) => {
          let postContext = data?.postData.data as postInterface;
          return {
            ...postContext,
            metadatauri: data?.metadatauri,
            cl_pubkey: data ? data.cl_pubkey : "",
            profile: data ? data.profile : "",
          };
        });
    }
  } catch (err) {
    console.log("error", err);
  }
};

export const parseGumData = (raw: any) => {
  const gumParsedData = raw!.map((item: any) => {
    const obj: IFeed = {
      profile: item.profile,
      title: item.content.blocks[1] && item.content.blocks[1].data.text!, // That's how the text stored now
      id: item.cl_pubkey,
      createdAt: "",
      readTime: "",
      image: item.content.blocks[2] && item.content.blocks[2].data.file!.url,
      source: {
        image: "",
      },
    };
    return obj;
  });

  return gumParsedData;
};
