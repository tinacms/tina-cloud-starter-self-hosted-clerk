import { ClerkAuthManager, ClerkUserManager } from "./clerk-auth";

export type User = {
  id: string
  email: string
}

export type UserManager = {
  listUsers: () => Promise<User[]>
  createUser: (email: string) => Promise<void>
  deleteUser: (email: string) => Promise<void>
}

export type AuthManager = {
  isAuthenticated: (req: any, res: any) => Promise<boolean>
  isAuthorized: (req: any, res: any) => Promise<boolean>
}

export const makeUserManagementApi = (authManager: AuthManager, userManager: UserManager) => {
  return async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" })
    }

    const authenticated = await authManager.isAuthenticated(req, res)
    if (!authenticated) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const isAuthorized = await authManager.isAuthorized(req, res)
    if (!isAuthorized) {
      return res.status(403).json({ message: "Forbidden" })
    }

    const { user, op } = req.body
    if (op === 'add') {
      await userManager.createUser(user.email)
    } else if (op === 'delete') {
      await userManager.deleteUser(user.email)
    } else {
      return res.status(400).json({ message: "Bad request" })
    }

    return res.json({ message: "OK" })
  }
}

export const authManager = new ClerkAuthManager(process.env.TINA_PUBLIC_CLERK_ORG_ID, process.env.CLERK_SECRET)
export const userManager = new ClerkUserManager(process.env.TINA_PUBLIC_CLERK_ORG_ID, process.env.CLERK_SECRET)
