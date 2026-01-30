import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { ShipWheelIcon } from "lucide-react";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside
      className="w-64 bg-base-200 border-r border-x-base-300 hidden lg:flex flex-col h-screen sticky
  top-0"
    >
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex item gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span
            className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-t 
          from-primary to-secondary tracking-wider"
          >
            Sven
          </span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
