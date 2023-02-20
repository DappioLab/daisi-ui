import { getData } from "@/graphql/test1/query";

export async function getPostIdList() {
  let data = await getData();

  return data.map((item: any, index: any) => {
    return { params: { id: index.toString() } };
  });
  // return [
  //   {
  //     params: {
  //       id: "1",
  //     },
  //   },
  //   {
  //     params: {
  //       id: "2",
  //     },
  //   },
  //   {
  //     params: {
  //       id: "3",
  //     },
  //   },
  // ];
}

export async function getPostDetails(postId: number) {
  let data = await getData();

  // const dataSet = new Map();
  const dataSet: any = {};
  data.map((item: any, index: any) => {
    dataSet[index.toString()] = item;
  });

  // const dataSet = {
  //   "1": {
  //     title: "Post 1",
  //     description: "Lorem ipsum dolor sit amet...",
  //     date: "Oct 10, 2022",
  //   },
  //   "2": {
  //     title: "Post 2",
  //     description: "Lorem ipsum dolor sit amet...",
  //     date: "Oct 20, 2022",
  //   },
  //   "3": {
  //     title: "Post 3",
  //     description: "Lorem ipsum dolor sit amet...",
  //     date: "Oct 30, 2022",
  //   },
  // };
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

export default function Post({ postData }: any) {
  return (
    <div>
      {/* <div >{postData.title}</div>
      <div >
        {postData.description}
      </div>
      <div >Published On: {postData.date}</div> */}
      <h1>This is page {postData.symbol}</h1>
      <div>{postData.symbol}</div>
      <div>{postData.mint}</div>
      <div>{postData.logoURI}</div>
    </div>
  );
}
