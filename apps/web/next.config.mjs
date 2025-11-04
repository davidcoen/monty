import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  experimental: { externalDir: true },
  typescript: { ignoreBuildErrors: false },
  eslint: { dirs: ['app', 'components', 'lib'] },
  transpilePackages: ['@monty/lib'],
  webpack: (cfg) => cfg
};

export default config;
