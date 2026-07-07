import { FormEvent, useState } from "react";
import loginDeliveryIllustration from "../assets/images/login-delivery-illustration.png";

type LoginProps = {
  error?: string;
  onLogin: (email: string, password: string) => Promise<boolean>;
};

const LOGIN_ILLUSTRATION_LABEL = "Fluxo organizado de pedidos";

export function Login({ error, onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onLogin(email, password);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="brand-mark">
          <div className="brand-icon">FD</div>
          <strong>FILA DELIVERY</strong>
        </div>

        <div className="brand-copy">
          <h1>
            Seja Bem-vindo ao <span>Fila Delivery!</span>
          </h1>
          <p>
            Organize seu delivery, agilize pedidos e entregas e diga adeus à
            bagunça e aos gritos.
          </p>
          <strong>
            Mais controle, mais eficiência e mais tempo para o que realmente
            importa: <span className="highlight-clientes">Seus clientes.</span>
          </strong>
        </div>

        <div className="delivery-illustration" aria-label={LOGIN_ILLUSTRATION_LABEL}>
          <img alt="" src={loginDeliveryIllustration} />
        </div>
      </section>

      <section className="login-form-area">
        <form className="login-card" onSubmit={handleSubmit}>
          <div>
            <h2>Entrar no Fila Delivery</h2>
            <p>Acesse sua conta para continuar.</p>
          </div>

          <label>
            E-mail
            <div className="input-with-icon">
              <span>@</span>
              <input
                autoFocus
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Digite seu e-mail"
                required
                type="email"
                value={email}
              />
            </div>
          </label>

          <label>
            Senha
            <div className="input-with-icon">
              <span>#</span>
              <input
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </label>

          <div className="login-options">
            <label className="checkbox-row">
              <input type="checkbox" defaultChecked />
              Manter-me conectado
            </label>
            <a href="#suporte">Esqueci minha senha</a>
          </div>

          <button
            className="primary-button login-submit"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Entrando..." : "Entrar no painel"}
          </button>

          {error ? <p className="form-error">{error}</p> : null}

          <footer className="login-footer" id="suporte">
            <p>Ainda não possui acesso?</p>
            <a href="https://wa.me/5511999999999">
              Fale com nosso suporte e solicite seu acesso.
            </a>
          </footer>
        </form>
      </section>
    </main>
  );
}
