// import { join } from 'path';

const config = {
  typescript: { ignoreBuildErrors: false },
  eslint: { dirs: ['app', 'components', 'lib'] },
  webpack: (cfg) => cfg
};

export default config;
