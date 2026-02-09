import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getFriendsRequests, getUserFriends } from "../lib/api";

const NotificationProvider = ({ children }) => {
    const queryClient = useQueryClient();

    // Persistence Refs
    const lastSeenReqCount = useRef(parseInt(sessionStorage.getItem("lastToastCount") || "0"));
    const lastFriendCount = useRef(0);
    const isManuallyAccepting = useRef(false);

    // 1. Monitor Incoming Requests
    const { data: friendRequests } = useQuery({
        queryKey: ["friendRequests"],
        queryFn: getFriendsRequests,
        refetchInterval: 5000,
    });

    // 2. Monitor Friends List (for "Accepted" popups)
    const { data: friends = [] } = useQuery({
        queryKey: ["friends"],
        queryFn: getUserFriends,
    });

    const pendingCount = friendRequests?.incomingReqs?.length || 0;

    //  NEW INVITATION RECEIVED 
    useEffect(() => {
        if (pendingCount > 0 && pendingCount > lastSeenReqCount.current) {
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
                                <p className="text-xs opacity-70">{latestSender.fullName} wants to be friends</p>
                            </div>
                        </div>
                        <button onClick={() => { toast.dismiss(t); window.location.href = "/notifications" }} className="btn btn-primary btn-xs">View</button>
                    </div>
                ));
                lastSeenReqCount.current = pendingCount;
                sessionStorage.setItem("lastToastCount", pendingCount.toString());
            }
        } else {
            lastSeenReqCount.current = pendingCount;
            sessionStorage.setItem("lastToastCount", pendingCount.toString());
        }
    }, [pendingCount, friendRequests]);

    // SOMEONE ELSE ACCEPTED YOUR REQUEST 
    useEffect(() => {
        if (friends.length > lastFriendCount.current && lastFriendCount.current !== 0) {
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
        lastFriendCount.current = friends.length;
    }, [friends, queryClient]);

    return children;
};

export default NotificationProvider;