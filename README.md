> This README assumes you're using Tina with a self-hosted Mongo instance. [Read here](https://tina.io/docs/self-hosted/database-adapter/mongodb/) instructions on how to set that up

[Clerk](https://clerk.com) is a user management service which you can use for any self-hosted Tina setup.

## Running Tina locally

By default, Clerk auth will be used, to bypass it, set the .env variable accordingly:

```
echo "TINA_PUBLIC_IS_LOCAL=true" > .env
```

### Start the dev server

```
yarn dev
```

## Testing Clerk auth locally

When you're ready to work with Clerk, copy the `.env.sample` file:

```
cp .env.sample .env
```

Be sure to set the `TINA_PUBLIC_ALLOWED_EMAIL` env to the email you will use to sign with.

Visit [clerk.com](https://clerk.com/) to create an account and an "application". Once you've done that, navigate to the API Keys tab to find your credentials and store them in the .env file in your project.

![Clerk API Keys screenshot](/img/clerk-api-keys-screenshot.png)

```
yarn dev
```
