import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
/* Home page component */
const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsids, setOutgoingRequestsIds] = useState([]);

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });
  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  return <div>Home page</div>;
};
/* Export section */
export default HomePage;
