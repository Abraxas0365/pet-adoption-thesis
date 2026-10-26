import Sidebar from "@/components/layout/Sidebar";
import RescueView from "@/views/rescue";

export default function RescuePage() {
  return (
    <div className="flex max-w-full">
      <Sidebar />
      <RescueView />
    </div>
  );
}
