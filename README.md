

# 🚀 Tickr Frontend

This is the official frontend repository for the **Tickr** application, built using **Next.js 14** and initialized with `create-next-app`.

## ⚙️ Setup and Installation

Follow these quick steps to get the project running locally.

### 1\. Environment Configuration

Create a file named **`.env.local`** in the project root to define necessary environment variables:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### 2. Run Locally

Start the development server using your preferred package manager:

```bash

npm run dev
# or yarn dev, pnpm dev, bun dev
```

The application will be available at **[http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)**. The development server supports hot reloading for immediate feedback on code changes.

-----

##  Key Features

  * **Framework:** Built on the latest features of [Next.js](https://nextjs.org/docs).
  * **API Integration:** Connects to the backend service via the defined `NEXT_PUBLIC_API_URL`.
  * **Typography:** Optimized and loads the modern [Geist](https://vercel.com/font) font family using `next/font`.

##  Deployment

The easiest deployment method is via the **[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)**. Refer to the [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying) for details.

