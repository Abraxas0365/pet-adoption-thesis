import Sidebar from "@/components/layout/Sidebar";
import BrowsePets from "@/views/browse";

export default function BrowsePetsPage() {
  return (
    <div className="flex">
      <Sidebar />
      <BrowsePets />
    </div>
  );
}
