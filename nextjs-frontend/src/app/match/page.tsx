import Match from "@/views/match";
import Sidebar from "@/components/layout/Sidebar";
import { RouteMatcher } from "next/dist/server/route-matchers/route-matcher";

export default function MatchPage() {
    return (
        <div className="flex max-w-full">
            <Sidebar />
            <Match />
        </div>
    );
}