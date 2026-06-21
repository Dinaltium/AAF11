import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compile the workspace TS package that the Hub imports.
  transpilePackages: ['@aaf11/shared'],
};

export default withPayload(nextConfig);
