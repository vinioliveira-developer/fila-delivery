import { EmptyState } from "../../components/shared/EmptyState";
import { useReports } from "../../hooks/useReports";

function formatCurrency(value: number) {
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

export function ReportsAdmin() {
  const { stats, totalRestaurants, totalUsers, totalPlans, planUsage, isLoading, error } = useReports();

  const cards = [
    ["Total de restaurantes", totalRestaurants],
    ["Total de usuarios", totalUsers],
    ["Planos disponiveis", totalPlans],
    ["Clientes ativos", stats?.activeClients ?? 0],
    ["Clientes bloqueados", stats?.blockedClients ?? 0],
    ["Planos vencendo", stats?.expiringPlans ?? 0],
    ["Planos vencidos", stats?.expiredPlans ?? 0],
    ["Usuarios cadastrados", stats?.registeredUsers ?? 0],
    ["Pedidos hoje", stats?.todayOrders ?? 0],
    ["Receita mensal", formatCurrency(stats?.monthlyRevenue ?? 0)]
  ];

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">Admin</p>
        <h2>Relatórios</h2>
        <p>Indicadores e uso do sistema SaaS.</p>
      </div>

      {isLoading ? <EmptyState title="Carregando relatorios..." /> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!isLoading && !error ? (
        <>
          <div className="workflow-grid">
            {cards.map(([label, value]) => (
              <div className="workflow-step" key={String(label)}>
                <strong>{value}</strong>
                <p>{label}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <h3>Distribuição por plano</h3>
            {Object.keys(planUsage).length === 0 ? (
              <EmptyState title="Nenhum restaurante cadastrado." />
            ) : (
              <div className="order-grid">
                {Object.entries(planUsage).map(([plan, count]) => (
                  <article className="order-card" key={plan}>
                    <h3>{plan}</h3>
                    <div className="order-meta">
                      <span>{count} restaurante(s)</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
