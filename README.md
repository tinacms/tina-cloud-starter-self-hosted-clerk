> This README assumes you're using Tina with a self-hosted Mongo instance. [Read here](https://tina.io/docs/self-hosted/database-adapter/mongodb/) instructions on how to set that up

[Clerk](https://clerk.com) is a user management service which you can use for any self-hosted Tina setup.

## Getting Started

Visit [clerk.com](https://clerk.com/) to create an account and an "application". Once you've done that, navigate to the API Keys tab to find your credentials and store them in the .env file in your project.

![Clerk API Keys screenshot](/img/clerk-api-keys-screenshot.png)

```bash
CLERK_SECRET=sk_test_my-clerk-secret
TINA_PUBLIC_CLERK_PUBLIC_KEY=pk_test_my-clerk-public-key
TINA_PUBLIC_IS_LOCAL=false
```

> Note: In order to test the Clerk flow locally `TINA_PUBLIC_IS_LOCAL` is set to true. You can set that to false when not testing the Clerk integration.

## Start the app

```
yarn dev
```
