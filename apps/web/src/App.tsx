import { useState } from "react";
import { AdminLayout } from "./layouts/AdminLayout";
import { RestaurantLayout } from "./layouts/RestaurantLayout";
import { Delivery } from "./pages/Delivery";
import { History } from "./pages/History";
import { Home } from "./pages/Home";
import { Kitchen } from "./pages/Kitchen";
import { Login } from "./pages/Login";
import { ReadyCheck } from "./pages/ReadyCheck";
import { TvPreparing } from "./pages/TvPreparing";
import { TvReady } from "./pages/TvReady";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { RestaurantsAdmin } from "./pages/admin/RestaurantsAdmin";
import { PlansAdmin } from "./pages/admin/PlansAdmin";
import { UsersAdmin } from "./pages/admin/UsersAdmin";
import { ReportsAdmin } from "./pages/admin/ReportsAdmin";
import { ConfigAdmin } from "./pages/admin/ConfigAdmin";
import { useAuth } from "./hooks/useAuth";

function renderClientPage(page: string) {
  switch (page) {
    case "cozinha":
      return <Kitchen />;
    case "conferencia":
      return <ReadyCheck />;
    case "entrega":
      return <Delivery />;
    case "tv-preparo":
      return <TvPreparing />;
    case "tv-prontos":
      return <TvReady />;
    case "historico":
      return <History />;
    default:
      return <Home />;
  }
}

function renderAdminPage(page: string) {
  switch (page) {
    case "admin-restaurantes":
      return <RestaurantsAdmin />;
    case "admin-planos":
      return <PlansAdmin />;
    case "admin-usuarios":
      return <UsersAdmin />;
    case "admin-relatorios":
      return <ReportsAdmin />;
    case "admin-config":
      return <ConfigAdmin />;
    default:
      return <AdminDashboard />;
  }
}

export default function App() {
  const [page, setPage] = useState("home");
  const { session, login, logout, authError, isAdmin } = useAuth();

  if (!session) {
    return <Login error={authError} onLogin={login} />;
  }

  const activePage = isAdmin && !page.startsWith("admin-") ? "admin-dashboard" : page;

  return isAdmin ? (
    <AdminLayout
      activePage={activePage}
      establishmentName="Fila Delivery Admin"
      onLogout={logout}
      onNavigate={setPage}
    >
      {renderAdminPage(activePage)}
    </AdminLayout>
  ) : (
    <RestaurantLayout
      activePage={activePage}
      establishmentName={session.restaurant?.name ?? "Fila Delivery"}
      onLogout={logout}
      onNavigate={setPage}
    >
      {renderClientPage(activePage)}
    </RestaurantLayout>
  );
}
