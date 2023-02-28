import { gql } from "graphql-request";

export const cyberConnectEndpoint = "https://api.cyberconnect.dev/testnet/";

const ESSENCE_FRAGMENT = `
  fragment Essence on Essence {
    essenceID
    name
    symbol
    tokenURI
    metadata{
      metadata_id
      name
      description
      content
      image
      issue_date
    }
    createdBy{
      profileID
      handle
      avatar
      metadata
    }
  }
  `;

const PROFILE_FRAGMENT = `
  fragment Profile on Profile {
    id
    profileID
    handle
    essences {
      edges {
        node {
          ...Essence
        }
      }
    }
  }
  ${ESSENCE_FRAGMENT}
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
  query Profile {
    profiles {
      edges {
        node {
          ...Profile
        }
      }
    }
  }
  ${PROFILE_FRAGMENT}
`;

export const PROFILE_BY_ADDRESS_QUERY = gql`
  query Address($address: AddressEVM!) {
    address(address: $address) {
      wallet {
        primaryProfile {
          profileID
          handle
          avatar
          metadata
        }
      }
    }
  }
`;
