import { gql } from "graphql-request";

export const LOGIN_GET_MESSAGE_MUTATION = gql`
  mutation loginGetMessage($domain: String!, $address: AddressEVM!) {
    loginGetMessage(input: { domain: $domain, address: $address }) {
      message
    }
  }
`;

export const LOGIN_VERIFY_MUTATION = gql`
  mutation loginVerify(
    $domain: String!
    $address: AddressEVM!
    $signature: String!
  ) {
    loginVerify(
      input: { domain: $domain, address: $address, signature: $signature }
    ) {
      accessToken
    }
  }
`;
