import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google 프로필 이미지
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      // Kakao 프로필 이미지 (http/https 모두)
      { protocol: 'https', hostname: 'k.kakaocdn.net', pathname: '/**' },
      { protocol: 'http', hostname: 'k.kakaocdn.net', pathname: '/**' },
      // Naver 프로필 이미지
      { protocol: 'https', hostname: 'phinf.pstatic.net', pathname: '/**' },
      { protocol: 'https', hostname: 'ssl.pstatic.net', pathname: '/**' },
    ],
  },
};

export default nextConfig;
