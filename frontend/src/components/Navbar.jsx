import { Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";
import ThemeSelector from "./ThemeSelector";

import {
  BellIcon,
  LogOutIcon,
  HomeIcon,
  ChevronLeft,
  UsersIcon,
  X,
  PartyPopperIcon,
  Trash2Icon,
  PaletteIcon,
  CheckCircle2,
  UserCheck,
  BellRing,
  AlertCircle
} from "lucide-react";
import {
  getFriendsRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  deleteNotification
} from "../lib/api";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const { theme: currentTheme, setTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logoutMutation } = useLogout();

  const [activeMobilePanel, setActiveMobilePanel] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // New state for Pro Alert
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // DATA SYNC (Updates every 3 seconds as requested) 
  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendsRequests,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  const totalNotifications = (friendRequests?.incomingReqs?.length || 0) +
    (friendRequests?.acceptedReqs?.length || 0);

  // INSTANT UPDATE MUTATIONS 
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    queryClient.invalidateQueries({ queryKey: ["friends"] });
  };

  const { mutate: acceptMutation } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: invalidateAll,
  });

  const { mutate: rejectMutation } = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: invalidateAll,
  });

  const { mutate: deleteMutation } = useMutation({
    mutationFn: deleteNotification,
    onSuccess: invalidateAll,
  });

  const handleClearAll = () => {
    friendRequests?.acceptedReqs?.forEach((req) => deleteMutation(req._id));
  };

  //  NOTIFICATION COMPONENT 
  const NotificationContent = () => (
    <div className="flex flex-col h-full w-full bg-base-100 overflow-hidden">
      <div className="px-8 py-8 border-b-2 border-base-200 flex justify-between items-end bg-base-200/10">
        <div>
          <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Notifications</h3>
          <p className="text-[10px] font-bold text-primary uppercase mt-2 tracking-widest">
            {totalNotifications} New Updates
          </p>
        </div>
        {friendRequests?.acceptedReqs?.length > 0 && (
          <button onClick={handleClearAll} className="btn btn-ghost btn-xs text-error font-bold uppercase text-[10px] border border-error/20 rounded-full px-4">
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {totalNotifications === 0 ? (
          <div className="py-24 text-center opacity-20 flex flex-col items-center">
            <BellRing size={64} strokeWidth={1.5} />
            <p className="font-bold uppercase text-sm mt-4 tracking-widest">No new notifications</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* PENDING REQUESTS */}
            {friendRequests?.incomingReqs?.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Friend Requests</p>
                {friendRequests.incomingReqs.map((req) => (
                  <div key={req._id} className="bg-base-200 rounded-[2rem] p-5 border-2 border-base-300">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="size-14 rounded-2xl bg-base-100 p-1 shadow-sm shrink-0"
                        dangerouslySetInnerHTML={{ __html: req.sender?.profilePic }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm uppercase truncate">{req.sender?.fullName}</p>
                        <p className="text-[10px] font-bold text-primary uppercase">Wants to be friends</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => acceptMutation(req._id)}
                        className="btn btn-primary flex-1 rounded-xl font-bold uppercase text-[11px] h-10 min-h-0">
                        Accept
                      </button>
                      <button onClick={() => rejectMutation(req._id)}
                        className="btn btn-ghost bg-base-300/50 flex-1 rounded-xl font-bold uppercase text-[11px] h-10 min-h-0 text-error">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ACCEPTED ALERTS */}
            {friendRequests?.acceptedReqs?.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Recent Activity</p>
                {friendRequests.acceptedReqs.map((req) => (
                  <div key={req._id} className="flex items-center gap-4 p-4 bg-success/5 rounded-2xl border border-success/20">
                    <div className="size-10 rounded-xl bg-success text-success-content flex items-center justify-center shrink-0">
                      <UserCheck size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold tracking-tight leading-tight">
                        You and <span className="font-black uppercase">{req.recipient?.fullName}</span> are now friends!
                      </p>
                    </div>
                    <button onClick={() => deleteMutation(req._id)} className="btn btn-ghost btn-xs btn-circle opacity-40 hover:opacity-100">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 w-full px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-base-100/80 backdrop-blur-xl border-2 border-base-200 shadow-2xl rounded-[2.5rem] px-4 py-2">

          <div className="flex items-center bg-base-200/50 rounded-full p-1 border border-base-300/30">
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle btn-sm"><ChevronLeft size={18} /></button>
            <div className="w-[1px] h-4 bg-base-300 mx-1" />
            <Link to="/" className={`btn btn-circle btn-sm border-none ${isActive("/") ? "bg-primary text-primary-content" : "btn-ghost opacity-50"}`}><HomeIcon size={18} /></Link>
            <Link to="/friends" className={`btn btn-circle btn-sm border-none ${isActive("/friends") ? "bg-primary text-primary-content" : "btn-ghost opacity-50"}`}><UsersIcon size={18} /></Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:block"><ThemeSelector /></div>
            <button onClick={() => setActiveMobilePanel('themes')} className="btn btn-ghost btn-circle lg:hidden"><PaletteIcon size={20} /></button>

            <div className="relative" ref={dropdownRef}>
              <button onClick={() => {
                if (window.innerWidth < 1024) setActiveMobilePanel('notifications');
                else setIsDropdownOpen(!isDropdownOpen);
              }}
                className={`btn btn-circle border-none transition-all ${isDropdownOpen ? "bg-primary text-primary-content" : "bg-base-200"}`}>
                <div className="relative">
                  <BellIcon size={20} />
                  {totalNotifications > 0 && <span className="absolute -top-2 -right-2 size-5 bg-primary text-primary-content text-[10px] font-black rounded-full flex items-center justify-center border-2 border-base-100">{totalNotifications}</span>}
                </div>
              </button>
              {isDropdownOpen && (
                <div className="hidden lg:block absolute top-14 right-0 w-[420px] animate-in fade-in slide-in-from-top-2 duration-300 z-[100] rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-base-300"><NotificationContent /></div>
              )}
            </div>

            <div className="w-[1px] h-6 bg-base-300 mx-1 hidden sm:block" />

            <div className="flex items-center gap-1">
              <div className="size-10 rounded-2xl ring-2 ring-base-200 ring-offset-2 ring-offset-base-100 overflow-hidden bg-base-300" dangerouslySetInnerHTML={{ __html: authUser?.profilePic }} />
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="btn btn-ghost btn-circle btn-sm text-error/40 hover:text-error"
              >
                <LogOutIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* LOGOUT ALERT MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-base-100 border-4 border-base-200 p-8 rounded-[3rem] shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="size-16 rounded-3xl bg-error/10 text-error flex items-center justify-center mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Disconnect?</h3>
              <p className="text-xs font-bold opacity-50 uppercase tracking-widest mb-8">Are you sure you want to sign out of your session?</p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={() => {
                    logoutMutation();
                    setShowLogoutConfirm(false);
                  }}
                  className="btn btn-error rounded-2xl font-black uppercase tracking-widest h-14"
                >
                  Yes, Disconnect
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="btn btn-ghost rounded-2xl font-black uppercase tracking-widest h-14"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE SLIDERS */}
      <div className={`fixed inset-0 z-[110] lg:hidden transition-all duration-500 ${activeMobilePanel ? "visible" : "invisible"}`}>
        <div className={`absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-500 ${activeMobilePanel ? "opacity-100" : "opacity-0"}`} onClick={() => setActiveMobilePanel(null)} />

        <div className={`absolute bottom-0 left-0 right-0 h-[88vh] bg-base-100 rounded-t-[3rem] transition-transform duration-500 transform-gpu flex flex-col border-t-2 border-base-300 ${activeMobilePanel ? "translate-y-0" : "translate-y-full"}`}>
          <div className="w-12 h-1 bg-base-300 rounded-full mx-auto mt-5 mb-1 opacity-40" />
          <button onClick={() => setActiveMobilePanel(null)} className="absolute top-8 right-8 btn btn-circle btn-ghost bg-base-200 border border-base-300"><X size={20} /></button>

          <div className="flex-1 overflow-hidden">
            {activeMobilePanel === 'notifications' && <NotificationContent />}

            {activeMobilePanel === 'themes' && (
              <div className="p-10 h-full flex flex-col">
                <div className="mb-10">
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Appearance</h2>
                  <p className="text-[10px] font-bold text-primary uppercase mt-3 tracking-widest opacity-60">Change your theme</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-2 gap-4 pb-16">
                  {THEMES.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => setTheme(t.name)}
                      className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col gap-4 text-left active:scale-95 ${currentTheme === t.name ? "border-primary bg-primary/10 shadow-lg" : "border-base-200 bg-base-200"}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-black uppercase text-[11px] tracking-wider truncate">{t.name}</span>
                        {currentTheme === t.name && <div className="size-2 rounded-full bg-primary" />}
                      </div>
                      <div className="flex gap-1.5">
                        {t.colors.slice(0, 3).map((c, i) => (
                          <div key={i} className="size-3 rounded-full border border-black/5" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: oklch(var(--p)/0.2); border-radius: 10px; }
      `}} />
    </>
  );
};

export default Navbar;