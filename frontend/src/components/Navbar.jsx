import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, ShipWheelIcon, CheckIcon, Trash2Icon, PartyPopperIcon, XIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFriendsRequests, acceptFriendRequest, rejectFriendRequest } from "../lib/api";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isChatPage = location.pathname?.startsWith("/chat");
  const { logoutMutation } = useLogout();

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendsRequests,
  });

  const totalNotifications = (friendRequests?.incomingReqs?.length || 0) +
    (friendRequests?.acceptedReqs?.length || 0);

  const closeMenus = () => {
    const drawer = document.getElementById("mobile-drawer");
    if (drawer) drawer.checked = false;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const { mutate: acceptReq } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const { mutate: rejectReq } = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friendRequests"] }),
  });

  const NotificationContent = () => (
    <div className="flex flex-col h-full overflow-hidden bg-base-100">
      <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-200/50">
        <h3 className="font-bold text-sm tracking-tight text-base-content">Activity Feed ({totalNotifications})</h3>
        <label htmlFor="mobile-drawer" className="sm:hidden btn btn-ghost btn-xs btn-circle">
          <XIcon className="size-4" />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[450px]">
        {totalNotifications === 0 ? (
          <div className="p-12 text-center opacity-40">
            <BellIcon className="size-10 mx-auto mb-2" />
            <p className="text-sm font-medium italic">All caught up!</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* INCOMING */}
            {friendRequests?.incomingReqs?.map((req) => (
              <div key={req._id} className="p-4 hover:bg-base-200/50 transition-colors border-b border-base-200 last:border-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full bg-base-300"
                      dangerouslySetInnerHTML={{ __html: req.sender?.profilePic }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-base-content">{req.sender?.fullName}</p>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">New Invitation</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => rejectReq(req._id)} className="btn btn-ghost btn-xs flex-1 text-error border border-error/10 hover:bg-error/10">
                    Decline
                  </button>
                  <button onClick={() => acceptReq(req._id)} className="btn btn-primary btn-xs flex-1 shadow-sm">
                    Accept
                  </button>
                </div>
              </div>
            ))}

            {/* ACCEPTED */}
            {friendRequests?.acceptedReqs?.map((req) => (
              <div key={req._id} className="p-4 border-b border-base-200 last:border-0 bg-gradient-to-r from-success/5 to-transparent relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full w-1 bg-success"></div>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full bg-base-300 shadow-sm"
                      dangerouslySetInnerHTML={{ __html: req.sender?.profilePic }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-base-content">{req.sender?.fullName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="p-0.5 rounded-full bg-success/20">
                        <PartyPopperIcon className="size-3 text-success" />
                      </div>
                      <span className="text-[11px] font-semibold text-success/80">Connection established</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link
        to="/notifications"
        onClick={closeMenus}
        className="p-3 text-center text-[11px] font-bold hover:bg-base-200 border-t border-base-300 block text-primary uppercase tracking-tighter"
      >
        View Full History
      </Link>
    </div>
  );

  return (
    <div className="drawer drawer-end z-50">
      <input id="mobile-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col">
        <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end w-full">
              {isChatPage && (
                <div className="flex-1">
                  <Link to="/" className="flex items-center gap-2.5">
                    <ShipWheelIcon className="size-9 text-primary" />
                    <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-tr from-primary to-secondary tracking-wider">Sven</span>
                  </Link>
                </div>
              )}

              <div className="flex items-center gap-3 sm:gap-4">

                <div className="hidden sm:block dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle relative"
                    onMouseDown={(e) => {
                      if (document.activeElement === e.currentTarget) {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
                  >
                    <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                    {totalNotifications > 0 && (
                      <span className="badge badge-primary badge-sm absolute top-1 right-1 font-bold shadow-sm">
                        {totalNotifications}
                      </span>
                    )}
                  </div>
                  <div tabIndex={0} className="dropdown-content z-[1] menu p-0 shadow-2xl bg-base-100 border border-base-300 rounded-box w-80 mt-2 overflow-hidden">
                    <NotificationContent />
                  </div>
                </div>

                {/* MOBILE */}
                <label htmlFor="mobile-drawer" className="sm:hidden btn btn-ghost btn-circle relative">
                  <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                  {totalNotifications > 0 && (
                    <span className="badge badge-primary badge-sm absolute top-1 right-1 font-bold shadow-sm">
                      {totalNotifications}
                    </span>
                  )}
                </label>

                <ThemeSelector />

                <div className="avatar px-2">
                  <div className="w-8 h-8 rounded-full ring-1 ring-base-300 ring-offset-base-100 ring-offset-2">
                    <div className="w-full h-full rounded-full bg-base-300" dangerouslySetInnerHTML={{ __html: authUser?.profilePic }} />
                  </div>
                </div>

                <button className="btn btn-ghost btn-circle" onClick={() => logoutMutation()}>
                  <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="drawer-side sm:hidden">
        <label htmlFor="mobile-drawer" className="drawer-overlay"></label>
        <div className="min-h-full w-80 bg-base-100 shadow-xl border-l border-base-300">
          <NotificationContent />
        </div>
      </div>
    </div>
  );
};

export default Navbar;