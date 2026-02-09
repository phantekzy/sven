import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getFriendsRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    getUserFriends,
    unfriendUser
} from "../lib/api";
import { UserPlusIcon, UserXIcon, UsersIcon, MessageCircleIcon } from "lucide-react";
import { Link } from "react-router";

const Friends = () => {
    const queryClient = useQueryClient();

    const { data: requests, isLoading: loadingReqs } = useQuery({
        queryKey: ["friendRequests"],
        queryFn: getFriendsRequests,
    });

    const { data: friends, isLoading: loadingFriends } = useQuery({
        queryKey: ["friends"],
        queryFn: getUserFriends,
    });

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

    const { mutate: removeFriend } = useMutation({
        mutationFn: unfriendUser,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friends"] }),
    });

    if (loadingReqs || loadingFriends) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <span className="loading loading-dots loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl p-4 sm:p-8 space-y-10">

            {/* HEADER */}
            <div className="border-b border-base-300 pb-6">
                <h1 className="text-4xl font-black flex items-center gap-4 text-base-content">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <UsersIcon className="size-10 text-primary" />
                    </div>
                    Social Circle
                </h1>
                <p className="text-base-content/50 mt-2 font-medium">
                    Manage your connections and incoming invitations
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                <div className="lg:col-span-4 space-y-5">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-primary">
                            Requests
                        </h2>
                        <span className="badge badge-primary font-bold">
                            {requests?.incomingReqs?.length || 0}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {requests?.incomingReqs?.length === 0 ? (
                            <div className="bg-base-200/40 rounded-3xl p-8 text-center border-2 border-dashed border-base-300">
                                <p className="text-sm font-medium opacity-40">No pending invites</p>
                            </div>
                        ) : (
                            requests?.incomingReqs?.map((req) => (
                                <div key={req._id} className="bg-base-100 border border-base-300 rounded-3xl p-5 shadow-sm">
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="avatar">
                                            <div
                                                className="w-12 h-12 rounded-full bg-base-300 shadow-inner"
                                                dangerouslySetInnerHTML={{ __html: req.sender?.profilePic }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate text-base-content">{req.sender?.fullName}</p>
                                            <p className="text-[11px] text-primary font-bold uppercase tracking-tighter">Wants to chat</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => rejectReq(req._id)}
                                            className="btn btn-ghost btn-sm flex-1 rounded-xl border border-base-300"
                                        >
                                            Ignore
                                        </button>
                                        <button
                                            onClick={() => acceptReq(req._id)}
                                            className="btn btn-primary btn-sm flex-1 rounded-xl shadow-md"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-5">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-base-content/50">
                            My Friends
                        </h2>
                        <span className="badge badge-ghost font-bold">
                            {friends?.length || 0}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {friends?.length === 0 ? (
                            <div className="md:col-span-2 bg-base-200/20 rounded-[40px] p-16 text-center border border-base-300">
                                <div className="p-5 bg-base-100 rounded-3xl w-fit mx-auto mb-5 shadow-sm">
                                    <UserPlusIcon className="size-10 opacity-10" />
                                </div>
                                <h3 className="font-bold text-xl">Start your journey</h3>
                                <p className="text-sm opacity-50 max-w-xs mx-auto mt-2">
                                    Your friend list is empty. Go find some people to connect with!
                                </p>
                            </div>
                        ) : (
                            friends?.map((friend) => (
                                <div key={friend._id} className="group bg-base-100 hover:bg-base-200/50 border border-base-300 rounded-[2rem] p-5 transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="avatar">
                                            <div
                                                className="w-14 h-14 rounded-2xl bg-base-300 group-hover:rotate-3 transition-transform shadow-sm"
                                                dangerouslySetInnerHTML={{ __html: friend.profilePic }}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-black text-lg text-base-content">{friend.fullName}</p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="size-2 rounded-full bg-success animate-pulse"></span>
                                                <p className="text-[10px] font-bold uppercase opacity-40">Connected</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Link to="/chat" className="btn btn-ghost btn-circle btn-sm">
                                            <MessageCircleIcon className="size-4 opacity-40 group-hover:text-primary group-hover:opacity-100 transition-all" />
                                        </Link>
                                        <div className="dropdown dropdown-left">
                                            <button tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
                                                <UserXIcon className="size-4 opacity-20 hover:text-error hover:opacity-100 transition-all" />
                                            </button>
                                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-2xl w-44 border border-base-300">
                                                <li>
                                                    <button
                                                        onClick={() => removeFriend(friend._id)}
                                                        className="text-error font-bold flex items-center justify-between"
                                                    >
                                                        Remove Friend
                                                        <UserXIcon className="size-3" />
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Friends;