import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  experimental: { externalDir: true },
  typescript: { ignoreBuildErrors: false },
  eslint: { dirs: ['app', 'components', 'lib'] },
  transpilePackages: ['@monty/lib'],
  webpack: (cfg) => {
    cfg.resolve = cfg.resolve || {};
    cfg.resolve.alias = cfg.resolve.alias || {};
    cfg.resolve.alias['@/packages/db'] = join(__dirname, '..', '..', 'packages/db/src');
    cfg.resolve.alias['@monty/lib/plan'] = join(__dirname, '..', '..', 'packages/lib/plan/src');
    return cfg;
  },
};

export default config;
