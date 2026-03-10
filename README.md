# In-Person Tour Widget

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Docker Deployment

To deploy the application using Docker, follow these steps:

1. Build the Docker image:
   ```bash
   docker build -t in-person-tour-widget:latest .
   ```

2. Tag the image for Azure Container Registry (ACR):
   ```bash
   docker tag in-person-tour-widget:latest c4kacrstaging.azurecr.io/in-person-tour-widget:latest
   ```

3. Login to ACR:
   ```bash
   docker login c4kacrstaging.azurecr.io -u c4kacrstaging -p <access-key>
   ```

4. Push the image to ACR:
   ```bash
   docker push c4kacrstaging.azurecr.io/in-person-tour-widget:latest
   ```

   Note: The repository "in-person-tour-widget" will be automatically created in ACR if it doesn't exist.

## Features

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a custom font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
