import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import app from "@/firebase";
import { useState } from "react";

const UploadImageBtn = () => {
  const [imgUploadProgress, setImgUploadProgress] = useState(0);

  const uploadImg = (file: any) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImgUploadProgress(Math.round(progress));
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
          default:
            break;
        }
      },
      (error) => {},
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          try {
            // API
            // const updateProfile = await API.updateUser({
            //   ...currentUser,
            //   profilePicture: downloadURL,
            // } as IUser);
            // console.log(updateProfile);
          } catch (error) {
            console.log(error);
          }

          // Update user state in redux
          console.log("downloaded " + downloadURL);
          // dispatch(changeProfile(downloadURL));
        });
      }
    );
  };

  return <div>Upload</div>;
};

export default UploadImageBtn;
