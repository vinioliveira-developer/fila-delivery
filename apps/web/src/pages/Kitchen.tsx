import { FormEvent, useState } from "react";
import { EmptyState } from "../components/shared/EmptyState";
import { OrderCard } from "../components/shared/OrderCard";
import { useOrders } from "../hooks/useOrders";
import { usePlatforms } from "../hooks/usePlatforms";
import { Platform } from "../types/order";
import { getPlatformHeaderStyle } from "../utils/orders";

export function Kitchen() {
  const { isLoading: isLoadingOrders, orders, ordersError, addOrder } = useOrders();
  const { activePlatforms, addPlatform, isLoading, platformError, removePlatform } =
    usePlatforms();
  const [newPlatform, setNewPlatform] = useState("");
  const [numbersByPlatform, setNumbersByPlatform] = useState<
    Record<Platform, string>
  >({});
  const [errorsByPlatform, setErrorsByPlatform] = useState<
    Partial<Record<Platform, string>>
  >({});
  const preparing = orders.filter((order) => order.status === "EM_PREPARO");

  async function handlePlatformSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (await addPlatform(newPlatform)) {
      setNumbersByPlatform((current) => ({
        ...current,
        [newPlatform.trim().toUpperCase()]: ""
      }));
      setNewPlatform("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>, platform: Platform) {
    event.preventDefault();
    const result = await addOrder({
      number: numbersByPlatform[platform] ?? "",
      platform
    });

    if (!result.ok) {
      setErrorsByPlatform((current) => ({
        ...current,
        [platform]:
          result.reason === "DUPLICATE"
            ? `Pedido ${result.duplicate?.number} ja esta ativo em ${platform}.`
            : result.reason === "API_ERROR"
              ? result.message
            : "Digite o numero do pedido."
      }));
      return;
    }

    setErrorsByPlatform((current) => ({ ...current, [platform]: undefined }));
    setNumbersByPlatform((current) => ({ ...current, [platform]: "" }));
  }

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">Cozinha</p>
        <h2>Adicionar pedido em preparo</h2>
        <p>Cadastre as plataformas da loja e depois lance os pedidos.</p>
      </div>

      <div className="platform-entry-grid">
        <form className="platform-entry platform-register" onSubmit={handlePlatformSubmit}>
          <h3>Adicionar plataforma</h3>

          <label>
            Plataforma
            <input
              autoFocus
              onChange={(event) => setNewPlatform(event.target.value)}
              placeholder="Ex: IFOOD"
              value={newPlatform}
            />
          </label>

          <button className="primary-button" type="submit">
            Adicionar plataforma
          </button>

          {platformError ? <p className="form-error">{platformError}</p> : null}
        </form>

        {isLoading ? (
          <EmptyState title="Carregando plataformas..." />
        ) : null}

        {!isLoading && activePlatforms.length === 0 ? (
          <EmptyState
            title="Nenhuma plataforma cadastrada"
            description="Adicione a primeira plataforma para iniciar o fluxo de pedidos."
          />
        ) : null}

        {activePlatforms.map((platform, index) => (
          <form
            className="platform-entry"
            key={platform}
            onSubmit={(event) => handleSubmit(event, platform)}
          >
            <div
              className="platform-entry-header platform-card-header"
              style={getPlatformHeaderStyle(platform)}
            >
              <h3>{platform}</h3>
              <button
                aria-label={`Excluir plataforma ${platform}`}
                className="icon-danger-button"
                onClick={() => removePlatform(platform)}
                type="button"
              >
                X
              </button>
            </div>

            <label>
              Numero do pedido
              <input
                autoFocus={index === 0 && activePlatforms.length > 0}
                inputMode="numeric"
                onChange={(event) =>
                  setNumbersByPlatform((current) => ({
                    ...current,
                    [platform]: event.target.value
                  }))
                }
                placeholder="Ex: 4079"
                value={numbersByPlatform[platform] ?? ""}
              />
            </label>

            <button className="primary-button" type="submit">
              Adicionar
            </button>

            {errorsByPlatform[platform] ? (
              <p className="form-error">{errorsByPlatform[platform]}</p>
            ) : null}
          </form>
        ))}
      </div>

      <div>
        <div className="section-title">
          <h3>Em preparo</h3>
          <span>{preparing.length} pedidos</span>
        </div>

        <div className="order-list">
          {isLoadingOrders ? <EmptyState title="Carregando pedidos..." /> : null}
          {ordersError ? <p className="form-error">{ordersError}</p> : null}
          {preparing.map((order) => (
            <OrderCard compact key={order.id} order={order} />
          ))}
          {!isLoadingOrders && !ordersError && preparing.length === 0 ? (
            <EmptyState title="Nenhum pedido em preparo no momento." />
          ) : null}
        </div>
      </div>
    </section>
  );
}
