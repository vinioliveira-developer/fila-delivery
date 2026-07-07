import { EmptyState } from '../../components/shared/EmptyState';
import { useConfig } from '../../hooks/useConfig';

export function ConfigAdmin() {
  const { systemInfo, dashboard, adminEmail, isLoading, error } = useConfig();

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">Admin</p>
        <h2>Configurações</h2>
        <p>Visao geral das configuracoes e informacoes do sistema.</p>
      </div>

      {isLoading ? <EmptyState title="Carregando configuracoes..." /> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!isLoading && !error ? (
        <div>
          <div className="workflow-grid">
            <div className="workflow-step">
              <strong>{systemInfo?.name ?? '—'}</strong>
              <p>Nome da aplicacao</p>
            </div>
            <div className="workflow-step">
              <strong>{systemInfo?.version ?? '—'}</strong>
              <p>Versão</p>
            </div>
            <div className="workflow-step">
              <strong>{systemInfo?.environment ?? '—'}</strong>
              <p>Ambiente</p>
            </div>
            <div className="workflow-step">
              <strong>{systemInfo?.build ?? '—'}</strong>
              <p>Build</p>
            </div>
            <div className="workflow-step">
              <strong>{systemInfo?.date ?? '—'}</strong>
              <p>Data de build</p>
            </div>
            <div className="workflow-step">
              <strong>{systemInfo?.database ?? '—'}</strong>
              <p>Banco de dados</p>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <h3>Contato e operacao</h3>
            <div className="order-grid">
              <article className="order-card">
                <h3>E-mail de contato</h3>
                <div className="order-meta">
                  <span>{adminEmail ?? '—'}</span>
                </div>
              </article>

              <article className="order-card">
                <h3>Clientes ativos</h3>
                <div className="order-meta">
                  <span>{dashboard?.activeClients ?? 0}</span>
                </div>
              </article>

              <article className="order-card">
                <h3>Clientes bloqueados</h3>
                <div className="order-meta">
                  <span>{dashboard?.blockedClients ?? 0}</span>
                </div>
              </article>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
