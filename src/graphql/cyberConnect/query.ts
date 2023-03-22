import { gql } from "graphql-request";
import { AddressZero } from "@ethersproject/constants";

// CYBER_CONNECT_ENDPOINT = "https://api.cyberconnect.dev/testnet/";
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
  query getPostByID($id: String!, $address: AddressEVM!) {
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
        likedStatus(me: $address) {
          liked
          disliked
          proof {
            arweaveTxHash
          }
        }
      }
    }
  }
`;

export const POST_BY_ADDRESS_QUERY = gql`
  query getPostByAddress(
    $address: AddressEVM!
    $myAddress: AddressEVM! = AddressZero
  ) {
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
                      comments {
                        edges {
                          node {
                            ... on Comment {
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
  query getAllPosts($address: AddressEVM!) {
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
                  likedStatus(me: $address) {
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

export const GET_FOLLOWINGS_POST_BY_ADDRESS_QUERY = gql`
  query getFollowingsPostByAddress($address: AddressEVM!) {
    address(address: $address) {
      followingCount
      followings {
        edges {
          node {
            address {
              address
            }
            profile {
              handle
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
                      likedStatus(me: $address) {
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

export const GET_FOLLOWER_QUERY = gql`
  query getFollowers($handle: String!, $address: AddressEVM!) {
    profileByHandle(handle: $handle) {
      profileID
      handle
      avatar
      metadata
      followerCount
      followers {
        edges {
          node {
            address {
              wallet {
                profiles {
                  edges {
                    node {
                      profileID
                      handle
                      avatar
                      metadata
                      isFollowedByMe(me: $address)
                      owner {
                        address
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

export const GET_FOLLOWINGS_QUERY = gql`
  query getFollowings($address: AddressEVM!, $myAddress: AddressEVM!) {
    address(address: $address) {
      followings {
        edges {
          node {
            profile {
              profileID
              handle
              avatar
              metadata
              isFollowedByMe(me: $myAddress)
              owner {
                address
              }
            }
          }
        }
      }
    }
  }
`;
