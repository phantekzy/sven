import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendsRequests,
  deleteNotification
} from "../lib/api";
import {
  UserCheckIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  ClockIcon,
  MessageSquareIcon,
  XIcon
} from "lucide-react";
import { getLanguageFlag } from "../components/FriendCard";
import { Link } from "react-router";

/* Notifications page component */
const NotificationsPage = () => {
  const queryClient = useQueryClient();

  // Fetching friend requests and notifications
  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendsRequests,
  });

  // Mutation: Accept Friend Request
  const { mutate: acceptRequestMutation, isPending: isAccepting } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  // Mutation: Decline/Reject Friend Request
  const { mutate: declineRequestMutation, isPending: isDeclining } = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
  });

  // Mutation: Delete Single Notification Alert
  const { mutate: deleteNotificationMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-12">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-primary">Notifications</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <>
            {/* INCOMING REQUESTS SECTION */}
            {incomingRequests.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <UserCheckIcon className="size-6 text-primary" />
                  Friend Requests
                  <span className="badge badge-primary badge-md ml-2">{incomingRequests.length}</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {incomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                      <div className="card-body p-6 space-y-5">
                        <div className="flex items-center gap-4">
                          <div className="avatar">
                            <div className="size-16 rounded-full ring-2 ring-primary/10 ring-offset-base-100 ring-offset-2 shadow-inner">
                              <div
                                className="w-full h-full bg-base-300"
                                dangerouslySetInnerHTML={{ __html: request.sender?.profilePic }}
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-primary truncate">
                              {request.sender?.fullName}
                            </h3>
                            {request.sender?.location && (
                              <div className="flex items-center text-xs font-medium text-secondary/80 mt-1">
                                <MapPinIcon className="size-3.5 mr-1" />
                                {request.sender.location}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <div className="badge h-auto py-1.5 px-3 bg-secondary/10 border-secondary/20 text-secondary gap-2 rounded-lg">
                            <span className="text-base">{getLanguageFlag(request.sender?.nativeLanguage)}</span>
                            <span className="text-[10px] font-bold uppercase tracking-tight">Native: {request.sender?.nativeLanguage}</span>
                          </div>
                          <div className="badge h-auto py-1.5 px-3 bg-primary/10 border-primary/20 text-primary gap-2 rounded-lg">
                            <span className="text-base">{getLanguageFlag(request.sender?.learningLanguage)}</span>
                            <span className="text-[10px] font-bold uppercase tracking-tight">Learning: {request.sender?.learningLanguage}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-2">
                          <button
                            className="btn btn-outline btn-error flex-1"
                            onClick={() => declineRequestMutation(request._id)}
                            disabled={isAccepting || isDeclining}
                          >
                            <XCircleIcon className="size-4 mr-2" /> Decline
                          </button>
                          <button
                            className="btn btn-primary flex-1"
                            onClick={() => acceptRequestMutation(request._id)}
                            disabled={isAccepting || isDeclining}
                          >
                            {isAccepting ? <span className="loading loading-spinner loading-xs" /> : (
                              <><CheckCircleIcon className="size-4 mr-2" /> Accept</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ACCEPTED REQUESTS SECTION */}
            {acceptedRequests.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BellIcon className="size-6 text-success" />
                  New Connections
                </h2>

                <div className="space-y-4">
                  {acceptedRequests.map((notification) => (
                    <div
                      key={notification._id}
                      className="card card-side bg-base-200 border border-base-300 shadow-sm hover:border-success/30 transition-colors"
                    >
                      <div className="card-body p-4 sm:p-6 flex-row items-center gap-4">
                        <div className="avatar">
                          <div className="size-12 rounded-full ring-2 ring-success/10 ring-offset-base-100 ring-offset-2">
                            <div
                              className="w-full h-full bg-base-300"
                              dangerouslySetInnerHTML={{ __html: notification.recipient?.profilePic }}
                            />
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base-content">{notification.recipient?.fullName}</h3>
                            <span className="badge badge-success badge-sm text-[10px] font-bold uppercase gap-1">
                              <MessageSquareIcon className="size-3" /> New Friend
                            </span>
                          </div>
                          <p className="text-sm opacity-70">Accepted your friend request. Start a conversation!</p>
                          <div className="flex items-center text-[10px] font-semibold opacity-50 mt-1 uppercase tracking-wider">
                            <ClockIcon className="size-3 mr-1" /> Recently
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/chat/${notification.recipient?._id}`}
                            className="btn btn-ghost btn-circle btn-sm sm:btn-md"
                          >
                            <MessageSquareIcon className="size-5 text-primary" />
                          </Link>
                          <button
                            onClick={() => deleteNotificationMutation(notification._id)}
                            disabled={isDeleting}
                            className="btn btn-ghost btn-circle btn-sm text-error hover:bg-error/10"
                          >
                            <XIcon className="size-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* EMPTY STATE */}
            {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
              <div className="text-center py-20 bg-base-200 rounded-3xl border-2 border-dashed border-base-300">
                <BellIcon className="size-12 mx-auto opacity-20 mb-4" />
                <h3 className="text-xl font-bold">All caught up!</h3>
                <p className="opacity-60 mt-2">No new notifications at the moment.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;