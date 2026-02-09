import { Navigate, Route, Routes } from "react-router";
import { Toaster, toast } from "sonner";
import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFriendsRequests, getUserFriends } from "./lib/api";

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

  // Monitor Incoming Requests
  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendsRequests,
    enabled: isAuthenticated,
    refetchInterval: 8000,
  });

  // Monitor Friends List (for "Accepted" popups)
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: isAuthenticated,
  });

  const pendingCount = friendRequests?.incomingReqs?.length || 0;

  // Effect: Received Invitation
  useEffect(() => {
    if (isAuthenticated && pendingCount > 0 && pendingCount > lastSeenCountRef.current) {
      const latestSender = friendRequests?.incomingReqs?.[0]?.sender;
      if (latestSender) {
        toast.custom((t) => (
          <div className="alert bg-base-100 border-primary border shadow-2xl flex justify-between items-center gap-4 min-w-[320px] p-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="size-10 rounded-full border border-primary/20 overflow-hidden bg-base-300"
                  dangerouslySetInnerHTML={{ __html: latestSender.profilePic }} />
              </div>
              <div>
                <p className="font-bold text-sm text-primary">Invitation Received</p>
                <p className="text-xs opacity-70">{latestSender.fullName} wants to connect</p>
              </div>
            </div>
            <button onClick={() => { toast.dismiss(t); window.location.href = "/notifications" }} className="btn btn-primary btn-xs">View</button>
          </div>
        ));
        lastSeenCountRef.current = pendingCount;
        sessionStorage.setItem("lastToastCount", pendingCount.toString());
      }
    } else {
      lastSeenCountRef.current = pendingCount;
      sessionStorage.setItem("lastToastCount", pendingCount.toString());
    }
  }, [pendingCount, friendRequests, isAuthenticated]);

  // Effect: Someone Accepted your Request
  useEffect(() => {
    if (isAuthenticated && friends.length > lastFriendCountRef.current && lastFriendCountRef.current !== 0) {
      const isMutating = queryClient.isMutating({ mutationKey: ["acceptRequest"] });
      if (!isMutating) {
        const newFriend = friends[friends.length - 1];
        toast.custom((t) => (
          <div className="alert bg-base-100 border-success border shadow-2xl flex justify-between items-center gap-4 min-w-[320px] p-4">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="size-10 rounded-full border border-success/20 overflow-hidden bg-base-300"
                  dangerouslySetInnerHTML={{ __html: newFriend?.profilePic }} />
              </div>
              <div>
                <p className="font-bold text-sm text-success">Invitation Accepted</p>
                <p className="text-xs opacity-70">{newFriend?.fullName} accepted your request!</p>
              </div>
            </div>
            <button onClick={() => toast.dismiss(t)} className="btn btn-ghost btn-xs">Great</button>
          </div>
        ));
      }
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