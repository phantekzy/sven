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
import { CheckCircleIcon, MapPinIcon, UserIcon, UserPlusIcon, SparklesIcon } from "lucide-react";
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

  // --- MUTATIONS ---
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
    <div className="p-4 sm:p-6 lg:p-8 pb-20">
      <div className="container mx-auto space-y-10">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">Friends</h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UserIcon className="size-4 mr-2" /> Friend Requests
            {pendingCount > 0 && <span className="badge badge-primary ml-2 animate-pulse">{pendingCount}</span>}
          </Link>
        </div>

        {loadingFriends ? <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div> :
          friends.length === 0 ? <NoFriendsFound /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {friends.map((f) => <FriendCard key={f._id} friend={f} />)}
            </div>
          )}

        <section>
          <h2 className="text-2xl font-bold mb-6 text-primary">Expand Your Circle</h2>
          {loadingUsers ? <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const hasSent = outgoingRequestsids.has(user._id);
                const incomingId = incomingRequestMap.get(user._id);
                return (
                  <div key={user._id} className="card bg-base-200 border border-base-300 shadow-sm">
                    <div className="card-body p-6 text-primary">
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className="size-16 rounded-full overflow-hidden bg-base-300" dangerouslySetInnerHTML={{ __html: user?.profilePic }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{user.fullName}</h3>
                          {user.location && <div className="text-xs opacity-60"><MapPinIcon className="inline size-3 mr-1" />{user.location}</div>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <div className="badge badge-secondary badge-outline text-[10px] p-3 uppercase">Native: {user.nativeLanguage}</div>
                        <div className="badge badge-primary badge-outline text-[10px] p-3 uppercase">Learning: {user.learningLanguage}</div>
                      </div>
                      <div className="mt-6">
                        {incomingId ? (
                          <div className="flex gap-2">
                            <button className="btn btn-outline flex-1 btn-error" onClick={() => declineRequestMutation(incomingId)}>Decline</button>
                            <button className="btn btn-primary flex-1" onClick={() => acceptRequestMutation(incomingId)}>Accept</button>
                          </div>
                        ) : (
                          <button className={`btn w-full ${hasSent ? "btn-disabled" : "btn-primary"}`} onClick={() => sendRequestMutation(user._id)} disabled={hasSent || isPending}>
                            {hasSent ? <><CheckCircleIcon className="size-4 mr-2" /> Sent</> : <><UserPlusIcon className="size-4 mr-2" /> Send Request</>}
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