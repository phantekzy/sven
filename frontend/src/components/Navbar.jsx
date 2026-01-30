import { useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  return <div>Navbar</div>;
};

export default Navbar;
