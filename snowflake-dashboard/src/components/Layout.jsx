
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import GlobalFilters from "./GlobalFilters";

function Layout() {

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-content">
        <GlobalFilters  />

        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
