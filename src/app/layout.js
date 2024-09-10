import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Recipe Master",
  description: "Create and view awesome recipes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Cloudinary Upload Widget Script */}
        <Script
          src="https://widget.cloudinary.com/v2.0/global/all.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
