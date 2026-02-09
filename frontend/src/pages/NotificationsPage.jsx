import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendsRequests } from "../lib/api";

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

  const incomingRequests = friendRequests?.incomingReqs
  const acceptedRequests = friendRequests?.acceptedReqs




  return <div>Notifications</div>;
};
/* Export section */
export default NotificationsPage;
