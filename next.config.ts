import type { NextConfig } from 'next';

function toRemoteProtocol(protocol: string): 'http' | 'https' | null {
  const normalized = protocol.replace(':', '');
  return normalized === 'http' || normalized === 'https' ? normalized : null;
}

function getSupabaseImagePattern() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  try {
    const url = new URL(supabaseUrl);
    const protocol = toRemoteProtocol(url.protocol);
    if (!protocol) return null;

    return {
      protocol,
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: '/storage/v1/object/public/**',
    };
  } catch {
    return null;
  }
}

const supabaseImagePattern = getSupabaseImagePattern();

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pravatar.cc', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      ...(supabaseImagePattern ? [supabaseImagePattern] : []),
    ],
  },
};

export default nextConfig;
