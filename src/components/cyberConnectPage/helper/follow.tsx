import CyberConnect from "@cyberlab/cyberconnect-v2";

export const follow = async (
  handle: string,
  cyberConnect: CyberConnect,
  isFollow: boolean // true => follow the handle; false => unfollow the handle
) => {
  try {
    if (isFollow) {
      await cyberConnect.follow(handle);
    } else {
      await cyberConnect.unfollow(handle);
    }
    // no return data
  } catch (err) {
    console.log(err);
  }
};
