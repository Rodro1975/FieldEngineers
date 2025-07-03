import withPWA from "next-pwa";

const nextConfig = {
  // otras configuraciones Next.js si las hay
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
