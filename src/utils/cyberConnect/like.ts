import CyberConnect from "@cyberlab/cyberconnect-v2";

export const like = async (
  contendId: string,
  cyberConnect: CyberConnect,
  isLike: boolean
) => {
  try {
    if (isLike) {
      const res = await cyberConnect.like(contendId);
      console.log(res, "likeResponse");
      return {
        status: res.status,
        message: `post id: ${contendId} is liked.`,
      };
    } else {
      const res = await cyberConnect.dislike(contendId);
      console.log(res, "dislikeResponse");
      return {
        status: res.status,
        message: res.message,
      };
    }
  } catch (err) {
    console.log(err);
  }
};
