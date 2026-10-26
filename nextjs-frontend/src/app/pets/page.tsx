import Sidebar from "@/components/layout/Sidebar";
import BrowsePetsView from "@/views/browse";

export default function BrowsePetsPage() {
  return (
    <div className="flex max-w-full">
      <Sidebar />
      <BrowsePetsView />
    </div>
  );
}
