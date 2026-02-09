import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import {
  BellIcon,
  HomeIcon,
  ShipWheelIcon,
  UserIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getFriendsRequests } from "../lib/api";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendsRequests,
  });

  const incomingRequestsCount = friendRequests?.incomingReqs?.length || 0;

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-5 ">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-t from-primary to-secondary tracking-wider">
            Sven
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {/* Home */}
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/" ? "btn-active" : ""
            }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span className="text-base-content font-medium">Home</span>
        </Link>

        {/* Friends */}
        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/friends" ? "btn-active" : ""
            }`}
        >
          <UserIcon className="size-5 text-base-content opacity-70" />
          <span className="text-base-content font-medium">Friends</span>
        </Link>

        {/* Notifications */}
        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/notifications" ? "btn-active" : ""
            }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <BellIcon className="size-5 text-base-content opacity-70" />
              <span className="text-base-content font-medium">Notifications</span>
            </div>
            {incomingRequestsCount > 0 && (
              <span className="badge badge-primary badge-sm font-bold animate-pulse">
                {incomingRequestsCount}
              </span>
            )}
          </div>
        </Link>
      </nav>

      {/* User profile section */}
      <div className="p-4 mt-auto border-t border-base-300">
        <div className="flex items-center gap-3 px-2">
          <div className="avatar">
            <div className="size-10 rounded-full ring-1 ring-base-300 ring-offset-base-100 ring-offset-2">
              <div
                dangerouslySetInnerHTML={{ __html: authUser?.profilePic }}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base-content text-sm truncate">
              {authUser?.fullName}
            </p>
            <p className="text-[10px] text-success flex items-center gap-1.5 uppercase font-bold tracking-wider">
              <span className="size-1.5 rounded-full bg-success inline-block animate-pulse" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;