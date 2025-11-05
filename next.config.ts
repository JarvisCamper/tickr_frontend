import {loadEnvConfig} from '@next/env/';

const projectDir = process.cwd();

loadEnvConfig(projectDir);

const CONFIG = {
   PostgresURI: process.env.POSTGRES_URI ,
}
export default CONFIG;
