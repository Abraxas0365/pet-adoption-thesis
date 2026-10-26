import Sidebar from "@/components/layout/Sidebar";
import NotificationView from "@/views/notification";

export default function UserProfilePage() {
  return (
    <div className="flex max-w-full">
      <Sidebar />
      <NotificationView />
    </div>
  );
}
