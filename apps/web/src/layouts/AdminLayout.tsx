import { ReactNode } from "react";
import { AppShell } from "../components/shared/AppShell";

type AdminLayoutProps = {
  activePage: string;
  children: ReactNode;
  establishmentName: string;
  onLogout: () => void;
  onNavigate: (page: string) => void;
};

export function AdminLayout({
  activePage,
  children,
  establishmentName,
  onLogout,
  onNavigate
}: AdminLayoutProps) {
  return (
    <AppShell
      activePage={activePage}
      establishmentName={establishmentName}
      isAdmin
      onLogout={onLogout}
      onNavigate={onNavigate}
    >
      {children}
    </AppShell>
  );
}
