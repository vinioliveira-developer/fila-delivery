import { ReactNode, useEffect, useState } from "react";

type AppShellProps = {
  activePage: string;
  establishmentName: string;
  isAdmin?: boolean;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  children: ReactNode;
};

const clientLinks = [
  { id: "home", label: "Inicio" },
  { id: "cozinha", label: "Cozinha" },
  { id: "conferencia", label: "Conferencia" },
  { id: "entrega", label: "Entrega" },
  { id: "tv-preparo", label: "TV Preparo" },
  { id: "tv-prontos", label: "TV Prontos" },
  { id: "historico", label: "Historico" }
];

const adminLinks = [
  { id: "admin-dashboard", label: "Dashboard" },
  { id: "admin-restaurantes", label: "Restaurantes" },
  { id: "admin-usuarios", label: "Usuarios" },
  { id: "admin-planos", label: "Planos" },
  { id: "admin-relatorios", label: "Relatorios" },
  { id: "admin-config", label: "Configuracoes" }
];

export function AppShell({
  activePage,
  establishmentName,
  isAdmin = false,
  onLogout,
  onNavigate,
  children
}: AppShellProps) {
  const isTv = activePage.startsWith("tv-");
  const links = isAdmin ? adminLinks : clientLinks;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [activePage]);

  if (isTv) {
    return <main className="tv-shell">{children}</main>;
  }

  return (
    <div className="app-shell">
      <header className="mobile-topbar">
        <button
          aria-label="Abrir menu"
          aria-expanded={isMenuOpen}
          className="menu-button"
          onClick={() => setIsMenuOpen((value) => !value)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
        <strong>{establishmentName}</strong>
      </header>

      <aside className={isMenuOpen ? "sidebar open" : "sidebar"}>
        <div>
          <p className="eyebrow">Fila Delivery</p>
          <h1>{establishmentName}</h1>
        </div>

        <nav className="nav-list" aria-label="Telas do sistema">
          {links.map((link) => (
            <button
              className={activePage === link.id ? "nav-item active" : "nav-item"}
              key={link.id}
              onClick={() => onNavigate(link.id)}
              type="button"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <button className="logout-button" onClick={onLogout} type="button">
          Sair
        </button>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
