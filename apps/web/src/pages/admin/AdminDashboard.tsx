import { EmptyState } from "../../components/shared/EmptyState";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";

export function AdminDashboard() {
  const { dashboardError, isLoading, stats } = useAdminDashboard();

  const cards = [
    ["Clientes ativos", stats?.activeClients ?? 0],
    ["Clientes bloqueados", stats?.blockedClients ?? 0],
    ["Planos vencendo", stats?.expiringPlans ?? 0],
    ["Receita mensal", `R$ ${stats?.monthlyRevenue ?? 0}`],
    ["Pedidos processados", stats?.processedOrders ?? 0]
  ];

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">Admin</p>
        <h2>Dashboard administrativo</h2>
        <p>Visao geral da operacao SaaS do Fila Delivery.</p>
      </div>

      {isLoading ? <EmptyState title="Carregando dashboard..." /> : null}
      {dashboardError ? <p className="form-error">{dashboardError}</p> : null}

      {!isLoading && !dashboardError ? (
        <div className="workflow-grid">
          {cards.map(([label, value]) => (
            <div className="workflow-step" key={label}>
              <strong>{value}</strong>
              <p>{label}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
