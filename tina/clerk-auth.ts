import { Clerk } from "@clerk/backend";
import Cookies from "cookies";
import { AuthManager } from "./auth";
import { GraphQLError } from "graphql";
import {
  UsersQuery,
  UsersQueryVariables
} from "./__generated__/types";

const getTokens = (req, res) => {
  const cookies = new Cookies(req, res);
  return { headerToken: req.headers.authorization as string, cookieToken: cookies.get('__session') }
}

const authenticate = async (clerk, req?, res?) => {
  const tokens = getTokens(req, res)
  let headerToken = tokens.headerToken
  if (!headerToken) {
    headerToken = tokens.cookieToken
  }
  return clerk.authenticateRequest({headerToken})
}

export class ClerkAuthManager implements AuthManager {
  private readonly clerk

  constructor(private clerkSecret: string, private databaseClient: {
    request: ({ query, variables }: { query: any; variables: any }) => Promise<{
      variables: any;
      data: any;
      query: any;
      errors: ReadonlyArray<GraphQLError>
    }>; queries: {
      users(variables: UsersQueryVariables, options?: { branch?: string }): Promise<{
        data: UsersQuery;
        variables: UsersQueryVariables;
        query: string
      }>;
    }
  }) {
    this.clerk = Clerk({
      secretKey: clerkSecret
    })
  }

  async getClerkUser(userId: string): Promise<any> {
    const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      "headers": {
        "accept": "application/json",
        "authorization": `Bearer ${this.clerkSecret}`,
      },
      "method": "GET",
    });

    if (res?.status === 200) {
      return res.json()
    }
  }

  async isAuthenticated(req: any, res: any): Promise<boolean> {
    return (await authenticate(this.clerk, req, res)).status === 'signed-in'
  }

  async isAuthorized(req: any, res: any): Promise<boolean> {
    const auth = await authenticate(this.clerk, req, res)
    if (auth?.status === 'signed-in') {
      const clerkUser = await this.getClerkUser(auth.toAuth().userId)
      if (clerkUser) {
        const email = clerkUser.email_addresses.find(address => address.id === clerkUser.primary_email_address_id)
        const result = await this.databaseClient.queries.users({ relativePath: 'index.json' })
        const users = result?.data?.users?.users
        return !!users.find((user) => user.email === email.email_address )
      }
    }
  }
}
