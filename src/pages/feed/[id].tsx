import request, { gql } from "graphql-request";
import { endpoint } from "@/graphql/daily/query";

export const SOURCE_SHORT_INFO_FRAGMENT = gql`
  fragment SourceShortInfo on Source {
    id
    handle
    name
    permalink
    description
    image
    type
    active
  }
`;

export const POST_BY_ID_STATIC_FIELDS_QUERY = gql`
  query Post($id: ID!) {
    post(id: $id) {
      id
      title
      permalink
      image
      placeholder
      createdAt
      readTime
      tags
      commentsPermalink
      numUpvotes
      numComments
      source {
        ...SourceShortInfo
      }
      description
      summary
      toc {
        text
        id
      }
      type
    }
  }
  ${SOURCE_SHORT_INFO_FRAGMENT}
`;

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
    <div>
      hello world
      <div>{JSON.stringify(initialData)}</div>
      {/* <div >{postData.title}</div>
      <div >
        {postData.description}
      </div>
      <div >Published On: {postData.date}</div> */}
      {/* <h1>This is page {postData.symbol}</h1>
      <div>{postData.symbol}</div>
      <div>{postData.mint}</div>
      <div>{postData.logoURI}</div> */}
    </div>
  );
}
