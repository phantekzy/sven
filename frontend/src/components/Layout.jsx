import Sidebar from "./Sidebar";

const Layout = ({showSidebar=false}) => {
  return (
    <div className="min-h-screen">
      <div className="flex">
        {showSidebar && <Sidebar />}
      </div>
    </div>
  );
};

export default Layout;
