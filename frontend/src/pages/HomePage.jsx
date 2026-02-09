import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useRef } from "react";
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
import {
  CheckCircleIcon,
  MapPinIcon,
  UserIcon,
  UserPlusIcon,
  SparklesIcon,
} from "lucide-react";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsids, setOutgoingRequestsIds] = useState(new Set());

  // Track last seen count in session to prevent spamming popups on every refresh
  const lastSeenCountRef = useRef(parseInt(sessionStorage.getItem("lastToastCount") || "0"));
  const lastFriendCountRef = useRef(0);
  const isManuallyAccepting = useRef(false);

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendsRequests,
    refetchInterval: 5000,
  });

  const pendingCount = friendRequests?.incomingReqs?.length || 0;

  //  POP-UP: RECEIVED AN INVITATION 
  useEffect(() => {
    // Show if there are pending requests and we haven't acknowledged this count yet
    if (pendingCount > 0 && pendingCount > lastSeenCountRef.current) {
      const latestRequest = friendRequests?.incomingReqs?.[0];
      const latestSender = latestRequest?.sender;

      if (latestSender) {
        toast.custom((t) => (
          <div className="alert bg-base-100 border-primary border shadow-2xl flex justify-between items-center gap-4 min-w-[320px] p-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="size-10 rounded-full border border-primary/20 overflow-hidden bg-base-300"
                  dangerouslySetInnerHTML={{ __html: latestSender?.profilePic }} />
              </div>
              <div>
                <p className="font-bold text-sm text-primary">Invitation Received</p>
                <p className="text-xs opacity-70">{latestSender?.fullName} wants to be friends</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { toast.dismiss(t); window.location.href = "/notifications" }} className="btn btn-primary btn-xs">View</button>
            </div>
          </div>
        ), { duration: 5000 });

        // Save progress to session storage
        lastSeenCountRef.current = pendingCount;
        sessionStorage.setItem("lastToastCount", pendingCount.toString());
      }
    } else if (pendingCount < lastSeenCountRef.current) {
      // If user declined/accepted elsewhere, update the ref so future ones show up
      lastSeenCountRef.current = pendingCount;
      sessionStorage.setItem("lastToastCount", pendingCount.toString());
    }
  }, [pendingCount, friendRequests]);

  // POP-UP: OTHER PERSON ACCEPTED YOUR INVITATION 
  useEffect(() => {
    if (friends.length > lastFriendCountRef.current && lastFriendCountRef.current !== 0 && !isManuallyAccepting.current) {
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
    lastFriendCountRef.current = friends.length;
    isManuallyAccepting.current = false;
  }, [friends]);

  //  MUTATIONS 
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
    mutationFn: acceptFriendRequest,
    onMutate: () => { isManuallyAccepting.current = true; },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });

      const sender = friendRequests?.incomingReqs?.find(r => r._id === variables)?.sender;

      // POP-UP: YOU ACCEPTED (NOW FRIENDS) 
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
    friendRequests?.incomingReqs?.forEach((req) => {
      map.set(req.sender._id, req._id);
    });
    return map;
  }, [friendRequests]);

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-20">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Friends</h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UserIcon className="size-4 mr-2" />
            Friend Requests
            {pendingCount > 0 && (
              <span className="badge badge-primary badge-sm ml-2 font-bold animate-pulse">
                {pendingCount}
              </span>
            )}
          </Link>
        </div>

        {/* LOADING & LIST SECTIONS  */}
        {loadingFriends ? (
          <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id || friend.id} friend={friend} />
            ))}
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8 text-primary">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Expand Your Circle</h2>
            <p className="opacity-70 mt-2 text-secondary">Find the perfect match for your learning goals</p>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 border-2 border-dashed border-base-300 p-10 text-center flex flex-col items-center">
              <SparklesIcon className="size-10 text-primary animate-pulse mb-4" />
              <h3 className="font-bold text-xl text-primary">All Caught Up!</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsids.has(user._id);
                const incomingRequestId = incomingRequestMap.get(user._id);
                return (
                  <div key={user._id} className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="card-body p-6 space-y-5 text-primary">
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className="size-16 rounded-full ring-2 ring-primary/10 ring-offset-base-100 ring-offset-2 overflow-hidden">
                            <div className="w-full h-full bg-base-300" dangerouslySetInnerHTML={{ __html: user?.profilePic }} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate">{user.fullName}</h3>
                          {user.location && <div className="text-xs opacity-60"><MapPinIcon className="inline size-3 mr-1" />{user.location}</div>}
                        </div>
                      </div>

                      {/* Badge section  */}
                      <div className="flex flex-wrap gap-2">
                        <div className="badge h-auto py-1.5 px-3 bg-secondary/10 border-secondary/20 text-secondary gap-2 rounded-lg">
                          <span className="text-base">{getLanguageFlag(user.nativeLanguage)}</span>
                          <span className="text-[10px] font-bold uppercase tracking-tight ml-2">Native: {user.nativeLanguage}</span>
                        </div>
                        <div className="badge h-auto py-1.5 px-3 bg-primary/10 border-primary/20 text-primary gap-2 rounded-lg">
                          <span className="text-base">{getLanguageFlag(user.learningLanguage)}</span>
                          <span className="text-[10px] font-bold uppercase tracking-tight ml-2">Learning: {user.learningLanguage}</span>
                        </div>
                      </div>

                      <div className="mt-2">
                        {incomingRequestId ? (
                          <div className="flex gap-2">
                            <button className="btn btn-outline flex-1 border-error/30 text-error hover:bg-error hover:text-white" onClick={() => declineRequestMutation(incomingRequestId)}>Decline</button>
                            <button className="btn btn-primary flex-1" onClick={() => acceptRequestMutation(incomingRequestId)}>Accept</button>
                          </div>
                        ) : (
                          <button
                            className={`btn w-full ${hasRequestBeenSent ? "btn-disabled" : "btn-primary"}`}
                            onClick={() => sendRequestMutation(user._id)}
                            disabled={hasRequestBeenSent || isPending}
                          >
                            {hasRequestBeenSent ? <><CheckCircleIcon className="size-4 mr-2" /> Request Sent</> : <><UserPlusIcon className="size-4 mr-2" /> Send Friend Request</>}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;