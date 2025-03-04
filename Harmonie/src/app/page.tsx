import { getSongs } from "@/utils/db";
import { SongTable } from "@/components/songs/table";
import { columns } from "@/components/songs/columns";
import { auth } from "@/auth";
import { Suspense } from "react";
import { use } from "react";
import { Loader2 } from "lucide-react";
import Metadata from "@/utils/metadata";

export const dynamic = "force-dynamic";

function SongData({ showManageActions }: { showManageActions: boolean }) {
  const bmpData = use(getSongs("bmp"));
  const harmonieData = use(getSongs("harmonie"));
  console.log('BMP songs:', bmpData.length);
  console.log('Harmonie songs:', harmonieData.length);
  console.log('Total songs:', bmpData.length + harmonieData.length);
  const data = [...bmpData, ...harmonieData];

  return (
    <SongTable
      data={data}
      columns={columns}
      showManageActions={showManageActions}
    />
  );
}

export default async function HomePage() {
  const session = await auth();
  const userRole = session?.user?.role || 0;
  const showManageActions = userRole === 1 || userRole === 2;

  return (
    <div className="h-screen w-full mx-auto md:px-4 px-1">
      <Metadata title="Home"></Metadata>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center gap-2 p-4">
            <Loader2 className="h-8 w-8 my-10 animate-spin text-primary" />
          </div>
        }
      >
        <SongData showManageActions={showManageActions} />
      </Suspense>
    </div>
  );
}
