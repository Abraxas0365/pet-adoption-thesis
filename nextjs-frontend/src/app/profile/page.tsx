import Sidebar from "@/components/layout/Sidebar";
import ProfileView from "@/views/profile";

export default function UserProfilePage() {
  return (
    <div className="flex max-w-full">
      <Sidebar />
      <ProfileView />
    </div>
  );
}
