import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import { gql } from "graphql-request";

export class Connection {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(connectionAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.connection.fetch(connectionAccount);
  }

  public async create(
    fromProfile: anchor.web3.PublicKey,
    toProfile: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey
  ) {
    const instructionMethodBuilder = this.sdk.program.methods
      .createConnection()
      .accounts({
        fromProfile: fromProfile,
        toProfile: toProfile,
        user: userAccount,
        authority: owner,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const connectionPDA = pubKeys.connection as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
      connectionPDA,
    };
  }

  public delete(
    connectionAccount: anchor.web3.PublicKey,
    fromProfile: anchor.web3.PublicKey,
    toProfile: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey
  ) {
    return this.sdk.program.methods.deleteConnection().accounts({
      connection: connectionAccount,
      fromProfile: fromProfile,
      toProfile: toProfile,
      user: userAccount,
      authority: owner,
    });
  }
  /**
   * @deprecated This function is slow and may cause performance issues. Consider using getPostsByUser instead.
   */
  public async getALlConnectionAccounts(
    fromProfile?: anchor.web3.PublicKey,
    toProfile?: anchor.web3.PublicKey
  ): Promise<anchor.ProgramAccount<any>[]> {
    const connection = await this.sdk.program.account.connection.all([
      ...(fromProfile
        ? [{ memcmp: { offset: 8, bytes: fromProfile.toBase58() } }]
        : []),
      ...(toProfile
        ? [{ memcmp: { offset: 40, bytes: toProfile.toBase58() } }]
        : []),
    ]);
    return connection;
  }

  // GraphQL Query methods

  public async getAllConnections() {
    const query = gql`
      query GetAllConnections {
      gum_0_1_0_decoded_connection {
        toprofile
        fromprofile
        cl_pubkey
      }
    `;
    const result: any = await this.sdk.gqlClient?.request(query);
    return result.gum_0_1_0_decoded_connection;
  }

  public async getConnectionsByUser(userPubKey: anchor.web3.PublicKey) {
    const profiles = await this.sdk.profile.getProfilesByUser(userPubKey);
    const profilePDAs = profiles.map(
      (p) => p.cl_pubkey
    ) as anchor.web3.PublicKey[];
    const query = gql`
      query GetConnectionsByUser {
        gum_0_1_0_decoded_connection(where: {fromprofile: {_in: [${profilePDAs
          .map((pda) => `"${pda}"`)
          .join(",")}] }}) {
          fromprofile
          toprofile
          cl_pubkey
        }
      }
    `;
    const result: any = await this.sdk.gqlClient.request(query);
    return result.gum_0_1_0_decoded_connection;
  }

  public async getFollowersByProfile(
    profileAccount: anchor.web3.PublicKey
  ): Promise<string[]> {
    const query = gql`
      query GetFollowersByProfile($profileAccount: String!) {
        gum_0_1_0_decoded_connection(
          where: { toprofile: { _eq: $profileAccount } }
        ) {
          fromprofile
        }
      }
    `;
    const variables = {
      profileAccount: profileAccount.toBase58(),
    };
    const result = await this.sdk.gqlClient.request<{
      gum_0_1_0_decoded_connection: { fromprofile: string }[];
    }>(query, variables);
    const followers = result.gum_0_1_0_decoded_connection.map(
      (follower) => follower.fromprofile
    );
    return followers;
  }

  public async getFollowingsByProfile(
    profileAccount: anchor.web3.PublicKey
  ): Promise<string[]> {
    const query = gql`
      query GetFollowingsByProfile($profileAccount: String!) {
        gum_0_1_0_decoded_connection(
          where: { fromprofile: { _eq: $profileAccount } }
        ) {
          toprofile
        }
      }
    `;
    const variables = {
      profileAccount: profileAccount.toBase58(),
    };
    const result = await this.sdk.gqlClient.request<{
      gum_0_1_0_decoded_connection: { toprofile: string }[];
    }>(query, variables);
    const followings = result.gum_0_1_0_decoded_connection.map(
      (following) => following.toprofile
    );
    return followings;
  }
}
