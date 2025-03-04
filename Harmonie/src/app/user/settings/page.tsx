import { auth } from "@/auth";
import { SettingsForm } from "@/components/settingsForm";
import Metadata from "@/utils/metadata";
import { redirect } from "next/navigation";

export default async function UserSettings() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <main className="max-w-2xl min-h-screen flex flex-col items-center mx-auto p-2 md:p-8">
      <Metadata title="Settings"></Metadata>
      <div className="w-full">
        <SettingsForm />
      </div>
    </main>
  );
}
