import { getSongs } from "@/utils/db";
import { SongTable } from "@/components/songs/table";
import { columns } from "@/components/songs/columns";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const bmpData = await getSongs("bmp");
  const harmonieData = await getSongs("harmonie");
  const data = [...bmpData, ...harmonieData];

  return (
    <div className="h-screen w-full mx-auto md:px-4 px-1">
      <SongTable data={data} columns={columns} showManageActions={false} />
    </div>
  );
}
