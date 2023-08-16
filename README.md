> This README assumes you're using Tina with a self-hosted Mongo instance. [Read here](https://tina.io/docs/self-hosted/database-adapter/mongodb/) instructions on how to set that up

[Clerk](https://clerk.com) is a user management service which you can use for any self-hosted Tina setup.

## Running Tina locally without auth

The `dev` command sets an environment variable which tells Tina to bypass auth

```
yarn dev
```

## Running Tina locally with Clerk auth

Copy the `.env.example` file to `env`

```
cp .env.example .env
```

Be sure to set the `TINA_PUBLIC_ALLOWED_EMAIL` env to the email you will use to sign with.

Visit [clerk.com](https://clerk.com/) to create an account and an "application". Once you've done that, navigate to the API Keys tab to find your credentials and store them in the .env file in your project.

![Clerk API Keys screenshot](/img/clerk-api-keys-screenshot.png)

```
yarn dev:prod
```
