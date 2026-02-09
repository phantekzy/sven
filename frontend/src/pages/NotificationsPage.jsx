import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendsRequests } from "../lib/api";
import { UserCheckIcon, MapPinIcon, CheckCircleIcon } from "lucide-react";
import { getLanguageFlag } from "../components/FriendCard";

/* Notifications page component */
const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendsRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Notifications</h1>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  Friend Requests
                  <span className="badge badge-primary ml-2">{incomingRequests.length}</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {incomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                      <div className="card-body p-6 space-y-5">
                        {/* Header Section: Avatar + Name */}
                        <div className="flex items-center gap-4">
                          <div className="avatar">
                            <div className="size-16 rounded-full ring-2 ring-primary/10 ring-offset-base-100 ring-offset-2 shadow-inner">
                              <div
                                className="w-full h-full bg-base-300"
                                dangerouslySetInnerHTML={{
                                  __html: request.sender?.profilePic,
                                }}
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

                        {/* Languages Section */}
                        <div className="flex flex-wrap gap-2">
                          <div className="badge h-auto py-1.5 px-3 bg-secondary/10 border-secondary/20 text-secondary gap-2 rounded-lg">
                            <span className="text-base">{getLanguageFlag(request.sender?.nativeLanguage)}</span>
                            <span className="text-[10px] font-bold uppercase tracking-tight">
                              Native: {request.sender?.nativeLanguage}
                            </span>
                          </div>

                          <div className="badge h-auto py-1.5 px-3 bg-primary/10 border-primary/20 text-primary gap-2 rounded-lg">
                            <span className="text-base">{getLanguageFlag(request.sender?.learningLanguage)}</span>
                            <span className="text-[10px] font-bold uppercase tracking-tight">
                              Learning: {request.sender?.learningLanguage}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          className="btn btn-primary w-full mt-2"
                          onClick={() => acceptRequestMutation(request._id)}
                          disabled={isPending}
                        >
                          {isPending ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <>
                              <CheckCircleIcon className="size-4 mr-2" />
                              Accept Request
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;