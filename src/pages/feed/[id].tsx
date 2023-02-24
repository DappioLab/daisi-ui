import request from "graphql-request";
import style from "@/styles/feed/id.module.sass";
import moment from "moment";
import {
  endpoint,
  POST_BY_ID_STATIC_FIELDS_QUERY,
} from "@/graphql/daily/query";

export async function getStaticPaths() {
  return { paths: [], fallback: true };
}

export async function getStaticProps({ params }: any) {
  const { id } = params;
  try {
    const initialData = await request(
      endpoint,
      POST_BY_ID_STATIC_FIELDS_QUERY,
      { id }
    );
    return {
      props: {
        id,
        initialData,
      },
      revalidate: 60,
    };
  } catch (err) {}
}

export default function Feed({ initialData }: any) {
  return (
    <>
      {initialData && (
        <div className={style.feedId}>
          <h1>{initialData.post.title}</h1>
          <div className={style.tagBlock}>
            {initialData.post.tags.map((tag: string) => {
              return (
                <div key={tag} className={style.tag}>
                  #{tag}
                </div>
              );
            })}
          </div>
          <div className={style.timeBlock}>
            {moment(initialData.post.createdAt).format("MMMM DD, YYYY")}
            <span> -{initialData.post.readTime} read time</span>
          </div>
          <img
            src={initialData.post.image}
            alt="cover"
            className={style.coverImage}
          />
          <div className={style.interactNumBlock}>
            <span> {initialData.post.numUpvotes} Upvotes</span>
            <span>{initialData.post.numComments} Comments</span>
          </div>
        </div>
      )}
    </>
  );
}
