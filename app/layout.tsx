/* eslint-disable no-unused-expressions */
import React from "react";

import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Space_Grotesk } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-spaceGrotesk",
});

export const metadata: Metadata = {
  title: "AskDevs",
  description:
    "A comunity-driven platform asking and answering programig related questions.Seek Knowledge .share Knowledge and collaborate withn developers fron around the world.Explore topics in web development,alogorithms,new technologies,data structures and more..",

  icons: {
    icon: "/assets/images/site-logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance ={{
      elements:{
        formButtonPrimary:'primary-gradient',
        footerActionLink:'primary-text-gradient hover:text-primary-500'
      }
    }}>
      <html lang="en">
       
        <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
