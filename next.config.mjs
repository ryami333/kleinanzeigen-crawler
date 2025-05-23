/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    /**
     * Linting and building will be done in separate steps in the build
     * pipeline, so it's preferable to know whether each step passes independent
     * of the other.
     */
    ignoreDuringBuilds: true,
  },
  experimental: {
    /**
     * Enables automatic `integrity="sha384-…"` attributes being added to every
     * internal script and stylesheet.
     */
    sri: {
      algorithm: "sha384",
    },
  },
  typescript: {
    /**
     * Typechecking and building will be done in separate steps in the build
     * pipeline, so it's preferable to know whether each step passes independent
     * of the other.
     */
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: true,
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  cleanDistDir: true,
  output: "standalone",
};

export default nextConfig;
