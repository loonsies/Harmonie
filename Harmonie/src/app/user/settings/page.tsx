import LogoutButton from "@/components/buttons/LogoutButton";
import { auth } from "@/auth";

export default async function Protected() {
  const session = await auth();

  return (
    <main className="max-w-2xl min-h-screen flex flex-col items-center mx-auto">
      <div className="w-full flex justify-between my-10">
        <h1 className="text-2xl font-bold">HALLOWEEN!!!!</h1>
      </div>
    </main>
  );
}
