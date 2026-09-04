import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Every host that products, blogs, avatars or content images can come from.
    // If you paste an image URL from a new host into the admin panel, add its
    // hostname here or next/image will refuse to render it.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dentivital.com",
        pathname: "/wp-content/uploads/**",
      },
      // Admin image uploads
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Google account avatars (Google sign-in)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
