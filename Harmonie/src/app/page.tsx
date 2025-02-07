import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Auth0Button from "@/components/buttons/Auth0";
import DiscordButton from "@/components/buttons/DiscordButton";
import GoogleButton from "@/components/buttons/GoogleButton";
import LoginButton from "@/components/buttons/LoginButton";
import LogoutButton from "@/components/buttons/LogoutButton";

export default async function Home() {
  const session = await auth();

  if (session) {
    console.log(session);
  }

  return <main className=""></main>;
}
