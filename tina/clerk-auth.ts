import { Clerk } from "@clerk/backend";
import Cookies from "cookies";
import { AuthManager, User, UserManager } from "./auth";

// TODO - limit / offset
export const listUsers = async (secretKey: string, email?: string) => {
  const res = await fetch(`https://api.clerk.com/v1/users?limit=10&offset=0&order_by=-created_at${email && `&email_address=${encodeURIComponent(email)}` || ''}`, {
    "headers": {
      "accept": "application/json",
      "authorization": `Bearer ${secretKey}`,
    },
    "method": "GET",
  });

  if (res.status !== 200) {
    throw new Error(`Failed to list users: ${await res.text()}`)
  }

  const users = await res.json()
  return users.map(user => {
    const email = user.email_addresses.find(email => email.id === user.primary_email_address_id)?.email
    return {
      id: user.id,
      email,
    }
  })
}

export const createUser = async (secretKey: string, email: string) => {
  const res = await fetch( `https://api.clerk.com/v1/users`, {
    headers: {
      ['Content-Type']: 'application/json',
      authorization: `Bearer ${secretKey}`
    },
    method: 'POST',
    body: JSON.stringify({
      email_address: [email],
      skip_password_requirement: true
    })
  })

  if (res.status !== 200) {
    throw new Error(`Failed to create user ${await res.text()}`)
  }
}

export const createMembership = async (orgId: string, secretKey: string, userId?: string, role = "basic_member") => {
  const res = await fetch(`https://api.clerk.com/v1/organizations/${orgId}/memberships`, {
    "headers": {
      ['Content-Type']: 'application/json',
      "authorization": `Bearer ${secretKey}`,
    },
    "body": JSON.stringify({ user_id: userId, role }),
    "method": "POST"
  });

  if (res.status !== 200) {
    throw new Error(`Unexpected error creating group membership: ${await res.text()}`)
  }
}


export class ClerkUserManager implements UserManager {
  constructor(private orgId: string, private clerkSecret: string) {
  }

  async createUser(email: string): Promise<void> {
    let users = await listUsers(this.clerkSecret, email)
    if (!users?.length) {
      await createUser(this.clerkSecret, email)
      users = await listUsers(this.clerkSecret, email)
      if (!users?.length) {
        throw new Error(`User not found`)
      }
    }
    await createMembership(this.orgId, this.clerkSecret, users[0].id)
  }

  async deleteUser(email: string): Promise<void> {
    const users = await listUsers(this.clerkSecret, email)
    if (!users?.length) {
      throw new Error('User not found')
    }
    const userId = users[0].id
    const res = await fetch(`https://api.clerk.com/v1/organizations/${this.orgId}/memberships/${userId}`, {
      "headers": {
        "accept": "application/json",
        "authorization": `Bearer ${this.clerkSecret}`,
      },
      "method": "DELETE"
    });

    if (res.status !== 200) {
      throw new Error(`Unexpected error deleting user ${await res.text()}`)
    }
  }


  async listUsers(): Promise<User[]> {
    const res = await fetch(`https://api.clerk.com/v1/organizations/${this.orgId}/memberships?limit=10&offset=0&order_by=-created_at`, {
      "headers": {
        "accept": "application/json",
        "authorization": `Bearer ${this.clerkSecret}`,
      },
      "method": "GET",
    });

    if (res.status !== 200) {
      throw new Error("Failed to fetch users")
    }

    const response = await res.json()
    return response.data.map(orgMember => {
      return {
        id: orgMember.public_user_data?.user_id,
        email: orgMember.public_user_data?.identifier,
      }
    })
  }
}

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
  private clerk
  constructor(private orgId: string, clerkSecret: string) {
    this.clerk = Clerk({
      secretKey: clerkSecret
    })
  }
  async isAuthenticated(req: any, res: any): Promise<boolean> {
    return (await authenticate(this.clerk, req, res)).status === 'signed-in'
  }

  async isAuthorized(req: any, res: any): Promise<boolean> {
    const auth = await authenticate(this.clerk, req, res)
    if (auth?.status === 'signed-in') {
      const orgs = await this.clerk.users.getOrganizationMembershipList({
        userId: auth.toAuth().userId,
      })
      if (
        orgs.find(
          (organizationMembership: { organization: { id: string } }) =>
            organizationMembership.organization.id ===
            this.orgId
        )
      ) {
        return true;
      }
    }
  }
}
