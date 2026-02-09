import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
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
import { CheckCircleIcon, MapPinIcon, UserIcon, UserPlusIcon, XCircleIcon } from "lucide-react";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

/* Home page component */
const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsids, setOutgoingRequestsIds] = useState(new Set());

  // Friends
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  // Recommended users
  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  // Outgoing friend Requests
  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  // Incoming friend Requests
  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendsRequests,
  });

  // --- Mutations ---
  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  const { mutate: acceptRequestMutation } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const { mutate: declineRequestMutation } = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friendRequests"] }),
  });

  // Logic to map sender IDs to Request IDs
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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
            Friends
          </h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UserIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
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
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
              Expand Your Circle
            </h2>
            <p className="opacity-70 text-secondary mt-2">
              Find the perfect match for your learning goals
            </p>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsids.has(user._id);
                const incomingRequestId = incomingRequestMap.get(user._id);

                return (
                  <div key={user._id} className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className="card-body p-6 space-y-5">
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className="size-16 rounded-full ring-2 ring-primary/10 ring-offset-base-100 ring-offset-2 shadow-inner">
                            <div className="w-full h-full bg-base-300" dangerouslySetInnerHTML={{ __html: user?.profilePic }} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-primary truncate">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs font-medium text-secondary/80 mt-1">
                              <MapPinIcon className="size-3.5 mr-1" /> {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <div className="badge h-auto py-1.5 px-3 bg-secondary/10 border-secondary/20 text-secondary gap-2 rounded-lg">
                          <span className="text-base">{getLanguageFlag(user.nativeLanguage)}</span>
                          <span className="text-[10px] font-bold uppercase tracking-tight">Native: {user.nativeLanguage}</span>
                        </div>
                        <div className="badge h-auto py-1.5 px-3 bg-primary/10 border-primary/20 text-primary gap-2 rounded-lg">
                          <span className="text-base">{getLanguageFlag(user.learningLanguage)}</span>
                          <span className="text-[10px] font-bold uppercase tracking-tight">Learning: {user.learningLanguage}</span>
                        </div>
                      </div>

                      {user.bio && (
                        <p className="text-sm leading-relaxed text-base-content/70 line-clamp-2 italic">"{user.bio}"</p>
                      )}

                      <div className="mt-2">
                        {incomingRequestId ? (
                          <div className="flex gap-2">
                            <button
                              className="btn btn-outline flex-1 border-error/30 text-error hover:bg-error hover:text-white"
                              onClick={() => declineRequestMutation(incomingRequestId)}
                            >
                              Decline
                            </button>
                            <button
                              className="btn btn-primary flex-1"
                              onClick={() => acceptRequestMutation(incomingRequestId)}
                            >
                              Accept
                            </button>
                          </div>
                        ) : (
                          <button
                            className={`btn w-full ${hasRequestBeenSent ? "btn-disabled" : "btn-primary"}`}
                            onClick={() => sendRequestMutation(user._id)}
                            disabled={hasRequestBeenSent || isPending}
                          >
                            {hasRequestBeenSent ? (
                              <><CheckCircleIcon className="size-4 mr-2" /> Request Sent</>
                            ) : (
                              <><UserPlusIcon className="size-4 mr-2" /> Send Friend Request</>
                            )}
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