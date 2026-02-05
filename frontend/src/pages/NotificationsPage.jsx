import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFriendsRequests } from "../lib/api";

/* Notifications page component */
const NotificationsPage = () => {
  const queryClient = useQueryClient()
  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendsRequests,
  })
  return <div>Notifications</div>;
};
/* Export section */
export default NotificationsPage;
