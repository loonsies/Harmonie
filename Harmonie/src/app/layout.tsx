import "@/app/globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import Provider from "@/components/Provider";
import NavBar from "@/components/NavBar";
import { auth } from "@/auth";

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
  const session = await auth();
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavBar
          name={session?.user?.name || ""}
          image={session?.user?.image || ""}
        ></NavBar>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
