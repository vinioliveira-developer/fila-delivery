import { EmptyState } from "../../components/shared/EmptyState";
import { useUsers } from "../../hooks/useUsers";

export function UsersAdmin() {
  const { users, isLoading, usersError } = useUsers();

  return (
    <section className="page">
      <div className="page-header">
        <p className="eyebrow">Admin</p>
        <h2>Usuarios</h2>
        <p>Visualize os usuarios do sistema e acompanhe o estado atual refletido pelos restaurantes cadastrados.</p>
      </div>

      {isLoading ? (
        <EmptyState title="Carregando usuarios..." />
      ) : usersError ? (
        <p className="form-error">{usersError}</p>
      ) : users.length === 0 ? (
        <EmptyState title="Nenhum usuario cadastrado." />
      ) : (
        <div className="order-grid">
          {users.map((user) => (
            <article className="order-card" key={user.id}>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <div className="order-meta">
                <span>{user.role}</span>
                <span>{user.active ? "Ativo" : "Inativo"}</span>
                {user.restaurantName ? <span>{user.restaurantName}</span> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
