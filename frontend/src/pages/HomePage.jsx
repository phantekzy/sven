import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
  getFriendsRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { MapPinIcon, ShipWheelIcon, UserIcon } from "lucide-react";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsids, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({ queryKey: ["friends"], queryFn: getUserFriends });
  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({ queryKey: ["users"], queryFn: getRecommendedUsers });
  const { data: outgoingFriendReqs } = useQuery({ queryKey: ["outgoingFriendReqs"], queryFn: getOutgoingFriendReqs });
  const { data: friendRequests } = useQuery({ queryKey: ["friendRequests"], queryFn: getFriendsRequests });

  const pendingCount = friendRequests?.incomingReqs?.length || 0;

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      const targetUser = recommendedUsers.find(u => u._id === variables);
      toast.custom((t) => (
        <div className="alert bg-base-100 border-info border shadow-2xl flex justify-between items-center gap-4 min-w-[320px] p-4">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="size-10 rounded-full border border-info/20 overflow-hidden bg-base-300"
                dangerouslySetInnerHTML={{ __html: targetUser?.profilePic }} />
            </div>
            <div>
              <p className="font-bold text-sm text-info">Invitation Sent</p>
              <p className="text-xs opacity-70">Sent to {targetUser?.fullName}</p>
            </div>
          </div>
          <button onClick={() => toast.dismiss(t)} className="btn btn-ghost btn-xs">Close</button>
        </div>
      ));
    }
  });

  const { mutate: acceptRequestMutation } = useMutation({
    mutationKey: ["acceptRequest"],
    mutationFn: acceptFriendRequest,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });

      const sender = friendRequests?.incomingReqs?.find(r => r._id === variables)?.sender;
      toast.custom((t) => (
        <div className="alert bg-base-100 border-success border shadow-2xl flex justify-between items-center gap-4 min-w-[320px] p-4">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="size-10 rounded-full border border-success/20 overflow-hidden bg-base-300"
                dangerouslySetInnerHTML={{ __html: sender?.profilePic }} />
            </div>
            <div>
              <p className="font-bold text-sm text-success">Now Friends!</p>
              <p className="text-xs opacity-70">You and {sender?.fullName} are connected</p>
            </div>
          </div>
          <button onClick={() => toast.dismiss(t)} className="btn btn-ghost btn-xs">Nice</button>
        </div>
      ));
    },
  });

  const { mutate: declineRequestMutation } = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friendRequests"] }),
  });

  const incomingRequestMap = useMemo(() => {
    const map = new Map();
    friendRequests?.incomingReqs?.forEach((req) => map.set(req.sender._id, req._id));
    return map;
  }, [friendRequests]);

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs) {
      outgoingFriendReqs.forEach((req) => outgoingIds.add(req.recipient._id));
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-base-100 p-4 md:p-10 pb-32">

      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating Characters */}
        <div className="absolute top-20 left-[5%] animate-[float_8s_infinite] text-primary/20 font-black text-9xl select-none">A</div>
        <div className="absolute top-[40%] left-[85%] animate-[float_12s_infinite] text-secondary/20 font-black text-[12rem] select-none opacity-30">文</div>
        <div className="absolute bottom-[20%] left-[10%] animate-[float_10s_infinite] text-accent/20 font-black text-8xl select-none">Ω</div>
        <div className="absolute top-[70%] left-[45%] animate-[float_15s_infinite] text-primary/10 font-black text-9xl select-none">Б</div>

        <div className="absolute top-[10%] right-[10%] animate-[peek_7s_infinite] opacity-30">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="#58cc02" />
            <circle cx="35" cy="40" r="8" fill="white" />
            <circle cx="65" cy="40" r="8" fill="white" />
            <path d="M40 70 Q50 80 60 70" stroke="white" strokeWidth="5" fill="none" />
          </svg>
        </div>

        <div className="absolute top-[35%] -left-10 animate-[float_9s_infinite] opacity-25">
          <div className="size-32 bg-info rounded-3xl rotate-12 flex items-center justify-center border-4 border-info-content/20">
            <div className="flex gap-4">
              <div className="size-3 bg-white rounded-full animate-pulse" />
              <div className="size-3 bg-white rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-[10%] right-[5%] animate-bounce opacity-20">
          <div className="w-24 h-28 bg-secondary rounded-t-full relative">
            <div className="absolute top-8 left-4 size-3 bg-white rounded-full" />
            <div className="absolute top-8 right-4 size-3 bg-white rounded-full" />
            <div className="absolute -bottom-4 left-0 w-full flex justify-around">
              <div className="size-6 bg-secondary rounded-full" />
              <div className="size-6 bg-secondary rounded-full" />
              <div className="size-6 bg-secondary rounded-full" />
            </div>
          </div>
        </div>

        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 animate-[float_11s_infinite] opacity-10">
          <div className="w-8 h-40 bg-warning rounded-b-lg relative">
            <div className="absolute -top-6 left-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[24px] border-b-orange-200" />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-24">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h1 className="text-6xl font-[1000] tracking-tighter text-base-content leading-none">
              STUDY <span className="text-primary italic drop-shadow-sm">SQUAD</span>
            </h1>
            <p className="font-bold opacity-40 uppercase tracking-[0.3em] text-xs">Level up your learning</p>
          </div>
          <Link to="/notifications" className="relative group active:translate-y-1 transition-all">
            <div className="absolute inset-0 bg-base-300 rounded-full translate-y-2" />
            <div className="relative bg-base-200 border-2 border-base-300 px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-3">
              <UserIcon className="size-4" />
              Requests {pendingCount > 0 && <span className="badge badge-primary">{pendingCount}</span>}
            </div>
          </Link>
        </header>

        {/* Friends Section */}
        <section className="space-y-8">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <div className="size-4 bg-success rounded-full animate-pulse shadow-[0_0_10px_#58cc02]" />
            Active Partners
          </h2>
          {loadingFriends ? <div className="loading loading-lg" /> :
            friends.length === 0 ? <NoFriendsFound /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {friends.map((f) => <FriendCard key={f._id} friend={f} />)}
              </div>
            )}
        </section>

        {/* Discovery Section */}
        <section className="space-y-12">
          <div className="inline-block relative">
            <h2 className="text-4xl font-black uppercase italic tracking-tight relative z-10">Expand Your World</h2>
            <div className="absolute -bottom-2 left-0 w-full h-4 bg-primary/10 -z-10 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {loadingUsers ? <div className="loading loading-lg text-primary" /> :
              recommendedUsers.map((user, index) => {
                const hasSent = outgoingRequestsids.has(user._id);
                const incomingId = incomingRequestMap.get(user._id);
                return (
                  <div
                    key={user._id}
                    className="group relative"
                    style={{
                      animation: `cardFloat 5s ease-in-out infinite`,
                      animationDelay: `${index * 0.3}s`
                    }}
                  >
                    <div className="absolute inset-0 bg-base-300 rounded-[3rem] translate-y-3" />
                    <div className="relative bg-base-100 border-2 border-base-300 rounded-[3rem] p-8 space-y-6 overflow-hidden">
                      <div className="flex flex-col items-center gap-4">
                        <div
                          className="size-28 rounded-[2.2rem] bg-base-200 p-1 border-b-8 border-base-300"
                          style={{
                            animation: `elementBob 3s ease-in-out infinite`,
                            animationDelay: `${index * 0.3}s`
                          }}
                        >
                          <div className="w-full h-full rounded-[1.8rem] overflow-hidden" dangerouslySetInnerHTML={{ __html: user?.profilePic }} />
                        </div>
                        <div className="text-center space-y-1">
                          <h3 className="text-2xl font-black">{user.fullName}</h3>
                          <span className="text-[10px] font-bold opacity-30 flex items-center justify-center gap-1 uppercase tracking-widest leading-none">
                            <MapPinIcon className="size-3" /> {user.location || "Online"}
                          </span>
                          <p className="text-xs font-medium opacity-60 line-clamp-2 max-w-[220px] mx-auto pt-2 italic">
                            {user.bio || "Ready to exchange languages!"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-3xl border-2 border-dashed border-base-300">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[8px] font-black opacity-30 uppercase">Native</span>
                          <div className="scale-110">{getLanguageFlag(user.nativeLanguage)}</div>
                        </div>
                        <ShipWheelIcon className="size-6 text-primary animate-spin-slow" />
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[8px] font-black text-primary/60 uppercase">Learning</span>
                          <div className="scale-110">{getLanguageFlag(user.learningLanguage)}</div>
                        </div>
                      </div>

                      <div className="w-full">
                        {incomingId ? (
                          <div className="flex gap-2">
                            <button onClick={() => declineRequestMutation(incomingId)} className="flex-1 py-3 font-black text-xs opacity-40 hover:opacity-100">Later</button>
                            <button onClick={() => acceptRequestMutation(incomingId)} className="flex-1 relative active:translate-y-1 transition-all">
                              <div className="absolute inset-0 bg-primary-focus rounded-2xl translate-y-1" />
                              <div className="relative bg-primary text-primary-content rounded-2xl py-4 font-black uppercase text-xs border-t border-white/20">Accept</div>
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled={hasSent || isPending}
                            onClick={() => sendRequestMutation(user._id)}
                            className={`relative w-full transition-all active:translate-y-2 ${hasSent ? "" : "group/btn"}`}
                          >
                            {!hasSent && <div className="absolute inset-0 bg-primary-focus rounded-[1.5rem] translate-y-2" />}
                            <div className={`relative w-full py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] border-t border-white/10 flex items-center justify-center
                              ${hasSent ? "bg-base-200 text-base-content/20" : "bg-primary text-primary-content"}`}>
                              {hasSent ? "Sent ✨" : "Add Friend"}
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        @keyframes peek {
          0%, 100% { transform: translateX(0) scale(1); }
          50% { transform: translateX(-30px) scale(1.05); }
        }
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes elementBob {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default HomePage;