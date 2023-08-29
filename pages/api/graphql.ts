import { NextApiHandler, NextApiRequest } from "next";
import databaseClient from "../../tina/__generated__/databaseClient";
import { Clerk } from "@clerk/backend";
// The same logic here is used during auth
import { isUserAllowed } from "../../tina/config";

const secretKey = process.env.CLERK_SECRET;
const clerk = Clerk({
  secretKey,
});

const isAuthorized = async (req: NextApiRequest) => {
  if (process.env.TINA_PUBLIC_IS_LOCAL === "true") {
    return true;
  }

  const requestState = await clerk.authenticateRequest({
    headerToken: req.headers["authorization"],
  });
  if (requestState.status === "signed-in") {
    const orgs = await clerk.users.getOrganizationMembershipList({
      userId: requestState.toAuth().userId,
    });
    if (
      orgs.find(
        (organizationMembership) =>
          organizationMembership.organization.id ===
          process.env.TINA_PUBLIC_CLERK_ORG_ID
      )
    ) {
      return true;
    }
  }
  return false;
};

const nextApiHandler: NextApiHandler = async (req, res) => {
  if (await isAuthorized(req)) {
    const { query, variables } = req.body;
    const result = await databaseClient.request({ query, variables });
    return res.json(result);
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export default nextApiHandler;
