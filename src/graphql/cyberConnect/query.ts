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
  query getPostByID($id: String!) {
    content(id: $id) {
      ... on Post {
        contentID
        title
        body
        digest
        authorHandle
        authorAddress
        arweaveTxHash
        createdAt
        updatedAt
        commentCount
        likeCount
        dislikeCount
      }
    }
  }
`;

export const POST_BY_ADDRESS_QUERY = gql`
  query getPostByAddress($address: AddressEVM!, $myAddress: AddressEVM!) {
    address(address: $address) {
      wallet {
        profiles {
          edges {
            node {
              posts {
                edges {
                  node {
                    contentID
                    ... on Post {
                      contentID
                      title
                      body
                      digest
                      authorHandle
                      authorAddress
                      arweaveTxHash
                      createdAt
                      updatedAt
                      commentCount
                      likeCount
                      dislikeCount
                      likedStatus(me: $myAddress) {
                        liked
                        disliked
                        proof {
                          arweaveTxHash
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
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
        profiles {
          edges {
            node {
              profileID
              handle
              avatar
              metadata
            }
          }
        }
      }
    }
  }
`;

export const GET_ALL_POSTS_QUERY = gql`
  query getAllPosts {
    profiles {
      edges {
        node {
          handle
          owner {
            address
          }
          posts {
            edges {
              node {
                contentID
                ... on Post {
                  contentID
                  authorHandle
                  authorAddress
                  title
                  body
                  digest
                  arweaveTxHash
                  createdAt
                  updatedAt
                  commentCount
                  likeCount
                  dislikeCount
                }
              }
            }
          }
          postCount
        }
      }
    }
  }
`;

export const GET_RELAY_ACTION_STATUS_QUERY = gql`
  query RalayAction($relayActionId: ID!) {
    relayActionStatus(relayActionId: $relayActionId) {
      ... on RelayActionQueued {
        reason
        queuedAt
      }
      ... on RelayActionStatusResult {
        txHash
        txStatus
        returnData {
          ... on RegisterEssenceReturnData {
            profileID
            essenceID
            name
            symbol
            essenceTokenURI
          }
        }
      }
      ... on RelayActionError {
        reason
        lastKnownTxHash
      }
    }
  }
`;

export const GET_FOLLOW_STATUS_QUERY = gql`
  query getFollowStatus($handle: String!, $myAddress: AddressEVM!) {
    profileByHandle(handle: $handle) {
      isFollowedByMe(me: $myAddress)
    }
  }
`;
