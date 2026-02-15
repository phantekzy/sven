import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import { getFriendsRequests } from "../lib/api";
import {
  BellIcon,
  HomeIcon,
  ShipWheelIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  LanguagesIcon
} from "lucide-react";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(
    JSON.parse(localStorage.getItem("sidebar-collapsed") || "false")
  );

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendsRequests,
    refetchInterval: 3000,
  });

  const totalNotifications = (friendRequests?.incomingReqs?.length || 0) +
    (friendRequests?.acceptedReqs?.length || 0);

  const menuGroups = [
    {
      label: "Menu",
      items: [
        { name: "Home", path: "/", icon: HomeIcon },
        { name: "Friends", path: "/friends", icon: UsersIcon },
        { name: "Profile", path: `/profile/${authUser?.username}`, icon: UserCircleIcon },
        { name: "Alerts", path: "/notifications", icon: BellIcon, count: totalNotifications },
      ]
    }
  ];

  return (
    <aside
      className={`relative hidden lg:flex flex-col h-screen sticky top-0 z-[100] transition-all duration-500 border-r-2 border-base-200 bg-base-100/95
      ${isCollapsed ? "w-24" : "w-80"}`}
    >
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none border-r-2 border-transparent">
        <div className="absolute -top-16 -right-16 size-64 opacity-20 group-hover:rotate-45 transition-transform duration-[3s]">
          <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 2" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M50 0 L50 100 M0 50 L100 50" stroke="currentColor" strokeWidth="0.2" />
          </svg>
        </div>

        <div
          className="absolute bottom-0 left-0 w-full h-1/2 opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            color: 'oklch(var(--p))'
          }}
        />

        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full opacity-[0.03] text-primary" viewBox="0 0 200 200">
          <path d="M20,100 Q60,40 100,100 T180,100" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M20,120 Q60,60 100,120 T180,120" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      {/*  COLLAPSE TOGGLE  */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-12 size-8 rounded-full bg-primary text-primary-content flex items-center justify-center border-4 border-base-100 shadow-xl z-[110] hover:scale-110 active:scale-95 transition-all"
      >
        {isCollapsed ? <ChevronRightIcon size={14} strokeWidth={3} /> : <ChevronLeftIcon size={14} strokeWidth={3} />}
      </button>

      {/*  CONTENT */}
      <div className="relative z-10 flex flex-col h-full">
        {/* BRANDING */}
        <div className={`p-8 mb-4 transition-all duration-500 ${isCollapsed ? "flex justify-center" : ""}`}>
          <Link to="/" className="flex items-center gap-4 group">
            <div className="size-12 rounded-[1.25rem] bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:rotate-12 transition-transform duration-500 shrink-0">
              <ShipWheelIcon className="size-7 text-white" strokeWidth={2.5} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-4">
                <span className="text-4xl font-black italic tracking-tighter uppercase leading-none text-base-content">
                  Sven
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-1">
                  <LanguagesIcon size={10} /> Language
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-4 space-y-2 no-scrollbar">
          {menuGroups[0].items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative flex items-center gap-4 px-4 py-4 rounded-[1.75rem] transition-all duration-300 group
                ${isActive ? "bg-primary text-primary-content shadow-lg shadow-primary/30" : "hover:bg-base-200/60 text-base-content/50 hover:text-base-content"} 
                ${isCollapsed ? "justify-center" : ""}`}
              >
                <div className="relative">
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "animate-pulse" : ""} />
                  {isCollapsed && item.count > 0 && (
                    <span className="absolute -top-2 -right-2 size-5 bg-error text-white text-[9px] font-black rounded-full border-2 border-base-100 flex items-center justify-center animate-bounce">
                      {item.count}
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <span className="text-sm font-black uppercase tracking-wide flex-1 whitespace-nowrap">
                    {item.name}
                  </span>
                )}

                {!isCollapsed && item.count > 0 && (
                  <span className={`px-2 py-1 min-w-[20px] rounded-lg text-[10px] font-black flex items-center justify-center border
                  ${isActive ? "bg-white text-primary border-transparent" : "bg-primary text-white border-base-100"}`}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* USER FOOTER */}
        <div className="p-6">
          <div className={`flex items-center gap-4 bg-base-200/50 backdrop-blur-sm border-2 border-base-200 transition-all duration-500 rounded-[2.5rem] ${isCollapsed ? "p-2 justify-center" : "p-4"}`}>
            <div className="relative shrink-0">
              <div className="size-12 rounded-2xl bg-base-100 p-1 ring-2 ring-primary/10 overflow-hidden shadow-inner">
                <div dangerouslySetInnerHTML={{ __html: authUser?.profilePic }} className="size-full" />
              </div>
              <div className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-success border-4 border-base-200" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <p className="font-black text-[13px] uppercase truncate text-base-content leading-none">
                  {authUser?.fullName}
                </p>
                <p className="text-[10px] font-bold opacity-40 truncate mt-1">
                  @{authUser?.username}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </aside>
  );
};

export default Sidebar;