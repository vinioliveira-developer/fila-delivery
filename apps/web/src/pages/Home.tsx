export function Home() {
  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">MVP operacional</p>
        <h2>Sistema de fila para retirada</h2>
        <p>
          Use as telas por funcao para simular o fluxo entre cozinha, balcao,
          entrega e televisoes.
        </p>
      </div>

      <div className="workflow-grid">
        <div className="workflow-step">
          <span>1</span>
          <strong>Cozinha</strong>
          <p>Cadastra pedidos em preparo.</p>
        </div>
        <div className="workflow-step">
          <span>2</span>
          <strong>Conferencia</strong>
          <p>Marca pedidos como prontos.</p>
        </div>
        <div className="workflow-step">
          <span>3</span>
          <strong>TV Prontos</strong>
          <p>Mostra pedidos liberados.</p>
        </div>
        <div className="workflow-step">
          <span>4</span>
          <strong>Entrega</strong>
          <p>Finaliza ou cancela retirada.</p>
        </div>
      </div>
    </section>
  );
}
