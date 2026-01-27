import pkg from '@next/env';
const { loadEnvConfig } = pkg;

loadEnvConfig(process.cwd());
console.log('✅ Environment variables loaded');
