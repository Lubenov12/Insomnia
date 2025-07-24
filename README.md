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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## API & Backend Usage

This project uses Next.js API routes for backend functionality. You can find the API endpoints in the `src/app/api/` directory. Each subfolder (e.g., `bolt`, `shipping`, `stripe`) contains a `route.ts` file that defines the backend logic for that endpoint.

### How to Use the Backend

- **Development:**

  - Start the development server with `npm run dev` (or your preferred package manager).
  - API routes will be available at `http://localhost:3000/api/<route>` (e.g., `/api/bolt`, `/api/shipping`, `/api/stripe`).
  - You can make HTTP requests to these endpoints from your frontend code or external tools like Postman/Insomnia.

- **Adding New Endpoints:**

  - Create a new folder inside `src/app/api/` and add a `route.ts` file.
  - Export a handler function using Next.js API route conventions.
  - The endpoint will be available at `/api/<your-folder>`.

- **Example Request:**
  ```js
  fetch("/api/bolt", {
    method: "POST",
    body: JSON.stringify({ key: "value" }),
    headers: { "Content-Type": "application/json" },
  });
  ```

For more details, see the [Next.js API routes documentation](https://nextjs.org/docs/app/building-your-application/routing/api-routes).
