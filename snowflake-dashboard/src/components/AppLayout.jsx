import { Outlet } from "react-router-dom";
import Header from "./Header";

function AppLayout() {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-layout-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;