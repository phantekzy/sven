import { useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";

const Sidebar = () => {
  const{authUser}=useAuthUser()
  const location = useLocation()
  const currentPath = location.pathname

  return <div>Sidebar</div>;
};

export default Sidebar;
