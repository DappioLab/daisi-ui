import { IFeed } from "./feed";

export interface Wallet {
  address: string;
  chainID: number;
  subscribing: string[];
}

export interface Profile {
  profileID: string;
  handle: string;
  avatarUrl: string;
  // owner: Wallet;
  feeds: IFeed[];
}

const Profile = () => {
  return <div>profile</div>;
};

export default Profile;
