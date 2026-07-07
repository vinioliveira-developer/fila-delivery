import { FormEvent, useEffect, useState } from "react";
import { EmptyState } from "../../components/shared/EmptyState";
import { usePlans } from "../../hooks/usePlans";
import { useRestaurants } from "../../hooks/useRestaurants";

const initialForm = {
  name: "",
  cnpj: "",
  phone: "",
  email: "",
  initialPassword: "",
  planId: "",
  status: "Ativo",
  expiresAt: ""
};

export function RestaurantsAdmin() {
  const {
    createRestaurant,
    deleteRestaurant,
    getRestaurant,
    isLoading,
    restaurants,
    restaurantsError,
    updateRestaurant
  } = useRestaurants();
  const { plans, isLoading: plansLoading, plansError } = usePlans();
  const [form, setForm] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("success");

  useEffect(() => {
    if (!form.planId && plans.length > 0) {
      setForm((current) => ({ ...current, planId: plans[0].id }));
    }
  }, [plans, form.planId]);

  function resetForm() {
    setForm(initialForm);
    setIsEditing(false);
    setEditingRestaurantId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      if (isEditing && editingRestaurantId) {
        await updateRestaurant(editingRestaurantId, form);
        setMessage("Restaurante atualizado com sucesso.");
      } else {
        await createRestaurant(form);
        setMessage("Restaurante cadastrado com sucesso.");
      }

      resetForm();
      setMessageType("success");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : isEditing
            ? "Erro ao atualizar restaurante."
            : "Erro ao cadastrar restaurante."
      );
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEdit(restaurantId: string) {
    try {
      const restaurant = await getRestaurant(restaurantId);
      setForm({
        name: restaurant.name,
        cnpj: restaurant.cnpj ?? "",
        phone: restaurant.phone ?? "",
        email: restaurant.email ?? "",
        initialPassword: "",
        planId: restaurant.planId ?? "",
        status: restaurant.status,
        expiresAt: restaurant.expiresAt
          ? new Date(restaurant.expiresAt).toISOString().slice(0, 10)
          : ""
      });
      setEditingRestaurantId(restaurant.id);
      setIsEditing(true);
      setMessage("");
      setMessageType("success");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Erro ao carregar restaurante."
      );
      setMessageType("error");
    }
  }

  async function handleDelete(restaurantId: string) {
    if (!window.confirm("Deseja excluir este restaurante?")) {
      return;
    }

    setMessage("");

    try {
      await deleteRestaurant(restaurantId);
      if (editingRestaurantId === restaurantId) {
        resetForm();
      }
      setMessage("Restaurante excluido com sucesso.");
      setMessageType("success");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Erro ao excluir restaurante."
      );
      setMessageType("error");
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">Admin</p>
        <h2>Restaurantes</h2>
        <p>Cadastre clientes e libere o primeiro acesso da loja.</p>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Nome do restaurante
          <input
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
            value={form.name}
          />
        </label>
        <label>
          CNPJ
          <input
            onChange={(event) => setForm({ ...form, cnpj: event.target.value })}
            required
            value={form.cnpj}
          />
        </label>
        <label>
          Telefone
          <input
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            required
            value={form.phone}
          />
        </label>
        <label>
          E-mail principal
          <input
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
            type="email"
            value={form.email}
          />
        </label>
        <label>
          Senha inicial
          <input
            onChange={(event) =>
              setForm({ ...form, initialPassword: event.target.value })
            }
            required={!isEditing}
            type="password"
            value={form.initialPassword}
          />
        </label>
        <label>
          Plano
          <select
            onChange={(event) => setForm({ ...form, planId: event.target.value })}
            value={form.planId}
          >
            <option value="" disabled>
              {plans.length > 0 ? "Selecione um plano" : "Carregando planos..."}
            </option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            onChange={(event) => setForm({ ...form, status: event.target.value })}
            value={form.status}
          >
            <option>Ativo</option>
            <option>Inativo</option>
          </select>
        </label>
        <label>
          Data de vencimento
          <input
            onChange={(event) =>
              setForm({ ...form, expiresAt: event.target.value })
            }
            required
            type="date"
            value={form.expiresAt}
          />
        </label>

        <div className="toolbar">
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? isEditing
                ? "Salvando..."
                : "Cadastrando..."
              : isEditing
                ? "Salvar alterações"
                : "Cadastrar restaurante"}
          </button>
          {isEditing ? (
            <button className="ghost-button" disabled={isSubmitting} onClick={resetForm} type="button">
              Cancelar
            </button>
          ) : null}
        </div>
        {message ? (
          <p className={messageType === "success" ? "success-message" : "form-error"}>
            {message}
          </p>
        ) : null}
      </form>

      {(isLoading || plansLoading) ? <EmptyState title="Carregando restaurantes..." /> : null}
      {restaurantsError ? <p className="form-error">{restaurantsError}</p> : null}
      {plansError ? <p className="form-error">{plansError}</p> : null}

      <div className="order-grid">
        {restaurants.map((restaurant) => (
          <article className="order-card" key={restaurant.id}>
            <h3>{restaurant.name}</h3>
            <p>{restaurant.email}</p>
            <div className="order-meta">
              <span>{restaurant.plan}</span>
              <span>{restaurant.status}</span>
              <span>{new Date(restaurant.expiresAt).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="toolbar">
              <button className="ghost-button" onClick={() => void handleEdit(restaurant.id)} type="button">
                Editar
              </button>
              <button className="danger-button" onClick={() => void handleDelete(restaurant.id)} type="button">
                Excluir
              </button>
            </div>
          </article>
        ))}
        {!isLoading && restaurants.length === 0 ? (
          <EmptyState title="Nenhum restaurante cadastrado." />
        ) : null}
      </div>
    </section>
  );
}
