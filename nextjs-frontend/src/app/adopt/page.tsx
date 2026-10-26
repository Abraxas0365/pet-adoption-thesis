import Sidebar from "@/components/layout/Sidebar";
import AdoptView from "@/views/adopt";

export default function AdoptPage() {
  return (
    <div className="flex max-w-full">
      <Sidebar />
      <AdoptView />
    </div>
  );
}
