import { ReactNode } from "react";
import { AppShell } from "../components/shared/AppShell";

type RestaurantLayoutProps = {
  activePage: string;
  children: ReactNode;
  establishmentName: string;
  onLogout: () => void;
  onNavigate: (page: string) => void;
};

export function RestaurantLayout({
  activePage,
  children,
  establishmentName,
  onLogout,
  onNavigate
}: RestaurantLayoutProps) {
  return (
    <AppShell
      activePage={activePage}
      establishmentName={establishmentName}
      onLogout={onLogout}
      onNavigate={onNavigate}
    >
      {children}
    </AppShell>
  );
}
