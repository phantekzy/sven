import { useQuery, useQueryClient } from "@tanstack/react-query";

/* Notifications page component */
const NotificationsPage = () => {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["friendRequests"]
  })
  return <div>Notifications</div>;
};
/* Export section */
export default NotificationsPage;
