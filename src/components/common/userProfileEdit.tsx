import app from "@/firebase";
import API from "@/axios/api";
import style from "@/styles/common/userProfileEdit.module.sass";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IUser } from "@/pages/profile";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/redux";
import { updateLoadingStatus } from "@/redux/globalSlice";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

interface IUserProfileEditProps {
  user: IUser;
  setShowUserEditModal: Dispatch<SetStateAction<boolean>>;
  getUser: () => Promise<void>;
}

const UserProfileEdit = (props: IUserProfileEditProps) => {
  const dispatch = useDispatch();
  const { userData } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const [_, setImgUploadProgress] = useState(0);
  const [img, setImg] = useState<File | null>(null);
  const [form, setForm] = useState<IUser>({
    address: props.user.address,
    username: "",
    description: "",
    profilePicture: "",
    id: userData.id,
    followers: [],
    followings: [],
    createdAt: "",
  });

  const uploadImg = (file: any) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
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
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          setForm((old) => {
            old.profilePicture = downloadURL;
            return JSON.parse(JSON.stringify(old));
          });
        });
      }
    );
  };

  const confirmUpdate = async () => {
    try {
      dispatch(updateLoadingStatus(true));
      await API.updateUser(form);
      props.setShowUserEditModal(false);
      props.getUser();
      dispatch(updateLoadingStatus(false));
    } catch (err) {
      dispatch(updateLoadingStatus(false));
      throw new Error(err);
    }
  };

  useEffect(() => {
    setForm(() => props.user);
  }, [props.user]);

  useEffect(() => {
    img && uploadImg(img);
  }, [img]);

  useEffect(() => {
    setForm((old) => {
      old.id = userData.id;
      return old;
    });
  }, [userData]);

  return (
    <div className={style.userProfileEdit}>
      <div className={style.bg}></div>
      <div className={style.modalContainer}>
        <div
          className={style.closeBtn}
          onClick={() => props.setShowUserEditModal(false)}
        >
          x
        </div>
        <div className={style.avatarRow}>
          <div className={style.avatar}>
            <img src={form.profilePicture} alt="avatar" />
          </div>
          <div className={style.uploadBtnBlock}>
            <>
              <div className={style.uploadBtn}>
                <label htmlFor="file-upload">Upload</label>
              </div>
              <input
                className={style.uploadInput}
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setImg(e.target.files![0])}
              />
            </>
            {/* )} */}
          </div>
        </div>
        <div className={style.inputBlock}>
          <div className={style.inputLabel}>Username</div>
          <input
            type="text"
            placeholder="username"
            className={style.input}
            value={form.username}
            onChange={(e) => {
              setForm((old) => {
                old.username = e.target.value;
                return JSON.parse(JSON.stringify(old));
              });
            }}
          />
        </div>
        <div className={style.inputBlock}>
          <div className={style.inputLabel}>description</div>
          <input
            type="text"
            placeholder="description"
            className={style.input}
            value={form.description}
            onChange={(e) => {
              setForm((old) => {
                old.description = e.target.value;
                return JSON.parse(JSON.stringify(old));
              });
            }}
          />
        </div>

        <div className={style.confirmBtn} onClick={() => confirmUpdate()}>
          Confirm
        </div>
      </div>
    </div>
  );
};

export default UserProfileEdit;
