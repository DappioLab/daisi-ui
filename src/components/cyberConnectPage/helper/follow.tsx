import CyberConnect from "@cyberlab/cyberconnect-v2";

const follow = async ({
  handle,
  cyberConnect,
  isFollow, // true => follow the handle; false => unfollow the handle
}: {
  handle: string;
  cyberConnect: CyberConnect;
  isFollow: boolean;
}) => {
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
