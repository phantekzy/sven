import { Navigate, Route, Routes } from "react-router";
import { Toaster, toast } from "sonner";
import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFriendsRequests, getUserFriends } from "./lib/api";
import { Check, X } from "lucide-react";

import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import PageLoader from "./components/PageLoader.jsx";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import Friends from "./pages/Friends.jsx";

/* Global Notification Logic */
const NotificationProvider = ({ children, isAuthenticated }) => {
  const queryClient = useQueryClient();
  const lastSeenCountRef = useRef(parseInt(sessionStorage.getItem("lastToastCount") || "0"));
  const lastFriendCountRef = useRef(0);

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendsRequests,
    enabled: isAuthenticated,
    refetchInterval: 8000,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: isAuthenticated,
  });

  const pendingCount = friendRequests?.incomingReqs?.length || 0;

  useEffect(() => {
    if (isAuthenticated && pendingCount > lastSeenCountRef.current) {
      const latestSender = friendRequests?.incomingReqs?.[0]?.sender;
      if (latestSender && window.location.pathname !== "/") {
        toast.custom((t) => (
          <div className="relative group animate-in slide-in-from-top-5">
            <div className="absolute inset-0 bg-primary rounded-2xl translate-y-1.5 translate-x-1" />
            <div className="relative bg-base-100 border-2 border-primary p-4 rounded-2xl flex items-center gap-4 min-w-[320px]">
              <div className="size-12 rounded-xl bg-base-200 border-b-4 border-base-300 overflow-hidden"
                dangerouslySetInnerHTML={{ __html: latestSender.profilePic }} />
              <div className="flex-1">
                <p className="font-black text-primary uppercase text-[10px] tracking-widest leading-none mb-1">New Invite</p>
                <p className="font-bold text-sm">{latestSender.fullName} sent a request</p>
              </div>
              <button onClick={() => { toast.dismiss(t); window.location.href = "/notifications" }} className="btn bg-primary text-primary-content border-none btn-sm rounded-xl font-black uppercase text-[10px]">View</button>
            </div>
          </div>
        ));
      }
    }
    lastSeenCountRef.current = pendingCount;
    sessionStorage.setItem("lastToastCount", pendingCount.toString());
  }, [pendingCount, friendRequests, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || lastFriendCountRef.current === 0) {
      lastFriendCountRef.current = friends.length;
      return;
    }

    const isAcceptingLocally = queryClient.isMutating({ mutationKey: ["acceptRequest"] }) > 0;

    // Show toast if friends increased 
    if (friends.length > lastFriendCountRef.current && !isAcceptingLocally) {
      const newFriend = friends[friends.length - 1];
      toast.custom((t) => (
        <div className="relative animate-in zoom-in-95">
          <div className="absolute inset-0 bg-success rounded-2xl translate-y-1.5 translate-x-1" />
          <div className="relative bg-base-100 border-2 border-success p-4 rounded-2xl flex items-center gap-4 min-w-[320px]">
            <div className="size-10 bg-success rounded-full flex items-center justify-center text-white shrink-0">
              <Check size={20} strokeWidth={4} />
            </div>
            <div className="flex-1">
              <p className="font-black text-success uppercase text-[10px] tracking-widest leading-none mb-1">Invitation Accepted</p>
              <p className="font-bold text-sm">{newFriend?.fullName} accepted your request!</p>
            </div>
            <button onClick={() => toast.dismiss(t)} className="btn btn-ghost btn-xs btn-circle opacity-40"><X size={14} /></button>
          </div>
        </div>
      ));
    }

    lastFriendCountRef.current = friends.length;
  }, [friends, isAuthenticated, queryClient]);

  return children;
};

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />;

  return (
    <NotificationProvider isAuthenticated={isAuthenticated}>
      <div className="min-h-screen" data-theme={theme}>
        <Toaster position="top-right" toastOptions={{ unstyled: true }} />
        <Routes>
          <Route path="/" element={isAuthenticated && isOnboarded ? <Layout showSidebar><HomePage /></Layout> : <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />} />
          <Route path="/signup" element={!isAuthenticated ? <SignUpPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />} />
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />} />
          <Route path="/notifications" element={isAuthenticated && isOnboarded ? <Layout showSidebar><NotificationsPage /></Layout> : <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />} />
          <Route path="/call" element={isAuthenticated ? <CallPage /> : <Navigate to="/login" />} />
          <Route path="/chat" element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />} />
          <Route path="/onboarding" element={isAuthenticated ? (!isOnboarded ? <OnboardingPage /> : <Navigate to="/" />) : <Navigate to="/login" />} />
          <Route path="/friends" element={isAuthenticated && isOnboarded ? <Layout showSidebar><Friends /></Layout> : <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />} />
        </Routes>
      </div>
    </NotificationProvider>
  );
};

export default App;