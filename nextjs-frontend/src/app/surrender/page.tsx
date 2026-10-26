import Sidebar from "@/components/layout/Sidebar";
import SurrenderView from "@/views/surrender";

export default function UserProfilePage() {
  return (
    <div className="flex max-w-full">
      <Sidebar />
      <SurrenderView />
    </div>
  );
}
