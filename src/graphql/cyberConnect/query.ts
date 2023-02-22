import { gql } from "graphql-request";

export const cyberConnectEndpoint = "https://api.cyberconnect.dev/testnet/";

const ESSENCE_FRAGMENT = `
fragment Essence on Essence {
  id
  handle
  essences(first: $first) {
    totalCount
    edges {
      node {
        essenceID
        name
        symbol
        tokenURI
      }
    }
  }
}
`;

export const POST_BY_ID_QUERY = gql`
  query getPost($id: String!) {
    post(id: $id) {
      id
      author
      title
      body
      createdAt
      updatedAt
      arweaveTxHash
    }
  }
`;

export const PROFILES_WITH_POSTS_QUERY = gql`
  query Profile($first: Int) {
    profiles(first: $first) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          ...Essence
        }
        cursor
      }
    }
  }
  ${ESSENCE_FRAGMENT}
`;
