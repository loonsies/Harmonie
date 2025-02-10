import { getSongs } from "@/utils/db";
import { SongTable } from "@/components/songs/table";
import { columns } from "@/components/songs/columns";

export default async function HomePage() {
  const data = await getSongs("bmp");

  return (
    <div className="h-screen w-full mx-auto md:px-4 px-1">
      <SongTable columns={columns} data={data}></SongTable>
    </div>
  );
}
