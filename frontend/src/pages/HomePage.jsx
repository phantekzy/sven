import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
/* Home page component */
const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsids, setOutgoingRequestsIds] = useState([]);
  return <div>Home page</div>;
};
/* Export section */
export default HomePage;
