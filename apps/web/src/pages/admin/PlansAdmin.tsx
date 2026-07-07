import { EmptyState } from "../../components/shared/EmptyState";
import { usePlans } from "../../hooks/usePlans";

function formatPrice(cents: number) {
  return `R$ ${Number(cents / 100).toFixed(2).replace('.', ',')}`;
}

function formatPeriod(billingCycle: string) {
  const periods: Record<string, string> = {
    MONTHLY: "1 mês",
    QUARTERLY: "3 meses",
    SEMIANNUAL: "6 meses",
    ANNUAL: "12 meses"
  };

  return periods[billingCycle] ?? billingCycle;
}

export function PlansAdmin() {
  const { plans, isLoading, plansError } = usePlans();

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">Admin</p>
        <h2>Planos</h2>
        <p>
          Planos com todos os recursos liberados. A diferença entre eles é apenas o
          período contratado e o valor.
        </p>
      </div>

      {isLoading ? (
        <EmptyState title="Carregando planos..." />
      ) : plansError ? (
        <p className="form-error">{plansError}</p>
      ) : plans.length === 0 ? (
        <EmptyState title="Nenhum plano configurado." />
      ) : (
        <div className="workflow-grid">
          {plans.map((plan) => (
            <article className="order-card" key={plan.id}>
              <div className="card-header">
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
              </div>

              <div className="card-meta">
                <span>
                  {formatPrice(plan.priceCents)} {formatPeriod(plan.billingCycle)}
                </span>
              </div>

              <div className="card-meta">
                <span>Todos os recursos do sistema inclusos</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
