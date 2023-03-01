import style from "@/styles/profile/id.module.sass";

export async function getPostIdList() {
  return [
    {
      params: {
        id: "1",
      },
    },
    {
      params: {
        id: "2",
      },
    },
    {
      params: {
        id: "3",
      },
    },
  ];
}

export async function getPostDetails(postId: number) {
  const dataSet = {
    "1": {
      title: "Post 1",
      description: "Lorem ipsum dolor sit amet...",
      date: "Oct 10, 2022",
    },
    "2": {
      title: "Post 2",
      description: "Lorem ipsum dolor sit amet...",
      date: "Oct 20, 2022",
    },
    "3": {
      title: "Post 3",
      description: "Lorem ipsum dolor sit amet...",
      date: "Oct 30, 2022",
    },
  };
  // @ts-ignore
  return dataSet[postId];
}

export async function getStaticPaths() {
  const paths = await getPostIdList();
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: any) {
  const postData = await getPostDetails(params.id);
  return {
    props: {
      postData,
    },
    revalidate: 30,
  };
}

export default function Feed({ initialData }: any) {
  return (
    <div className={style.profileId}>
      <div className={style.userInfo}>
        <div className={style.avatar}>
          <img src="/avatar.jpeg" alt="avatar" />
        </div>
        <div className={style.userInfoBlock}>
          <div className={style.userName}>Benson</div>
          <div className={style.userId}>@benson</div>
          <div className={style.userBio}>
            My name is Alex Drysdale and I am a Junior Web Developer for Oswald
            Technologies. I am an accomplished coder and programmer, and I enjoy
            using my skills to contribute to the exciting technological advances
            that happen every day at Oswald Tech
          </div>
          <div className={style.userJoinedDate}>Joined July 2018</div>
        </div>
      </div>
    </div>
  );
}
