import { Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import ThemeSelector from "./ThemeSelector";
import {
  BellIcon,
  LogOutIcon,
  HomeIcon,
  ChevronLeft,
  UsersIcon,
  XIcon,
  PartyPopperIcon,
  Trash2Icon,
  SettingsIcon,
} from "lucide-react";
import {
  getFriendsRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  deleteNotification
} from "../lib/api";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logoutMutation } = useLogout();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendsRequests,
  });

  const totalNotifications = (friendRequests?.incomingReqs?.length || 0) +
    (friendRequests?.acceptedReqs?.length || 0);

  //  MUTATIONS 
  const { mutate: deleteNotificationMutation } = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friendRequests"] }),
  });

  const handleClearAll = () => {
    friendRequests?.acceptedReqs?.forEach((req) => deleteNotificationMutation(req._id));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const NotificationContent = () => (
    <div className="flex flex-col h-full max-h-[500px] w-full bg-base-100 shadow-2xl overflow-hidden rounded-2xl border border-base-300">
      {/* HEADER */}
      <div className="px-5 py-4 bg-base-200/50 border-b border-base-300 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-base-content/80">Activity</h3>
          <p className="text-[10px] font-bold text-primary">{totalNotifications} Updates</p>
        </div>
        <div className="flex gap-2">
          {friendRequests?.acceptedReqs?.length > 0 && (
            <button onClick={handleClearAll} className="btn btn-ghost btn-xs text-error hover:bg-error/10 gap-1 px-2 uppercase text-[10px] font-bold">
              <Trash2Icon size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="overflow-y-auto custom-scrollbar">
        {totalNotifications === 0 ? (
          <div className="py-16 text-center">
            <BellIcon className="size-12 mx-auto opacity-10 mb-3" />
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Everything Read</p>
          </div>
        ) : (
          <div className="divide-y divide-base-200">
            {/* INCOMING */}
            {friendRequests?.incomingReqs?.map((req) => (
              <div key={req._id} className="p-4 bg-primary/5 hover:bg-primary/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full border-2 border-primary/20 overflow-hidden bg-base-300"
                    dangerouslySetInnerHTML={{ __html: req.sender?.profilePic }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate">{req.sender?.fullName}</p>
                    <p className="text-[9px] font-bold text-primary uppercase">Friend Request</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => acceptFriendRequest(req._id)} className="btn btn-primary btn-xs btn-square"><PartyPopperIcon size={14} /></button>
                  </div>
                </div>
              </div>
            ))}

            {/* ACCEPTED */}
            {friendRequests?.acceptedReqs?.map((req) => (
              <div key={req._id} className="p-4 hover:bg-base-200 transition-colors group relative">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full border-2 border-success/20 overflow-hidden bg-base-300"
                    dangerouslySetInnerHTML={{ __html: req.recipient?.profilePic }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{req.recipient?.fullName}</p>
                    <p className="text-[9px] font-bold text-success uppercase">New Connection</p>
                  </div>
                  <button onClick={() => deleteNotificationMutation(req._id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-error">
                    <XIcon size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link to="/notifications" onClick={() => setIsDropdownOpen(false)} className="py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] bg-base-200 hover:text-primary transition-colors border-t border-base-300">
        View All History
      </Link>
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 w-full px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-base-100/90 backdrop-blur-md border border-base-300 shadow-lg rounded-[2rem] px-4 py-2">

        {/* LEFT: NAV PILL */}
        <div className="flex items-center bg-base-200/50 rounded-full p-1 border border-base-300/50">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle btn-sm">
            <ChevronLeft size={20} />
          </button>
          <div className="w-[1px] h-4 bg-base-300 mx-1" />
          <Link to="/" className={`btn btn-circle btn-sm border-none ${isActive("/") ? "bg-primary text-primary-content shadow-md" : "btn-ghost opacity-60"}`}>
            <HomeIcon size={18} />
          </Link>
          <Link to="/friends" className={`btn btn-circle btn-sm border-none ${isActive("/friends") ? "bg-primary text-primary-content shadow-md" : "btn-ghost opacity-60"}`}>
            <UsersIcon size={18} />
          </Link>
        </div>

        {/* RIGHT: USER & UTILS */}
        <div className="flex items-center gap-3">
          <ThemeSelector />

          {/* NOTIFICATION DROPZONE */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`btn btn-circle btn-sm md:btn-md border-none transition-all ${isDropdownOpen ? "bg-primary text-primary-content" : "bg-base-200 hover:bg-base-300"}`}
            >
              <div className="relative">
                <BellIcon size={20} />
                {totalNotifications > 0 && (
                  <span className="absolute -top-2 -right-2 size-5 bg-primary text-primary-content text-[10px] font-black rounded-full flex items-center justify-center border-2 border-base-100">
                    {totalNotifications}
                  </span>
                )}
              </div>
            </button>

            {/* THE NOTIFICATION LAYER */}
            {isDropdownOpen && (
              <div className="absolute top-14 right-0 w-80 md:w-96 animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                <NotificationContent />
              </div>
            )}
          </div>

          <div className="w-[1px] h-6 bg-base-300 mx-1 hidden sm:block" />

          {/* PROFILE BUTTON */}
          <div className="flex items-center gap-2 pl-1">
            <div className="avatar">
              <div className="size-8 md:size-10 rounded-2xl ring-2 ring-base-300 ring-offset-2 ring-offset-base-100 overflow-hidden shadow-inner bg-base-200"
                dangerouslySetInnerHTML={{ __html: authUser?.profilePic }} />
            </div>
            <button onClick={() => logoutMutation()} className="btn btn-ghost btn-circle btn-sm text-error/60 hover:text-error hover:bg-error/10">
              <LogOutIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #8883; border-radius: 10px; }
      `}} />
    </nav>
  );
};

export default Navbar;
//dsadas