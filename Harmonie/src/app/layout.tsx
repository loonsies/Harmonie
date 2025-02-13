import "@/styles/globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import Provider from "@/components/provider";
import NavBar from "@/components/navBar/navBar";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Harmonie",
    default: "Harmonie",
  },
  description: "Harmonie - FFXIV Bard Repository",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <NavBar></NavBar>
          <Provider>{children}</Provider>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
