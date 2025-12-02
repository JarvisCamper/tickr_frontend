// import {loadEnvConfig} from '@next/env/';

// const projectDir = process.cwd();

// loadEnvConfig(projectDir);

// const CONFIG = {
//    PostgresURI: process.env.POSTGRES_URI ,
// }
// export default CONFIG;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Skip ESLint during production builds to allow fast deploys while fixing lint errors */
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
