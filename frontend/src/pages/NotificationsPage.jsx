import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendsRequests } from "../lib/api";
import { UserCheckIcon } from "lucide-react";

/* Notifications page component */
const NotificationsPage = () => {
  const queryClient = useQueryClient()
  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendsRequests,
  })

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] })
      queryClient.invalidateQueries({ queryKey: ["friends"] })
    }
  })

  const incomingRequests = friendRequests?.incomingReqs || []
  const acceptedRequests = friendRequests?.acceptedReqs || []




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
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
};
/* Export section */
export default NotificationsPage;
