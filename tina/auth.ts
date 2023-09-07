import databaseClient from "./__generated__/databaseClient";
import { ClerkAuthManager } from "./clerk-auth";

export type AuthManager = {
  isAuthenticated: (req: any, res: any) => Promise<boolean>
  isAuthorized: (req: any, res: any) => Promise<boolean>
}

export const authManager = new ClerkAuthManager(process.env.CLERK_SECRET, databaseClient)
