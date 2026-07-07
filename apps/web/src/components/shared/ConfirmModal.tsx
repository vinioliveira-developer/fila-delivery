type ConfirmModalProps = {
  actionLabel: string;
  cancelLabel?: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  variant?: "success" | "danger";
};

export function ConfirmModal({
  actionLabel,
  cancelLabel = "Voltar",
  description,
  onCancel,
  onConfirm,
  title,
  variant = "success"
}: ConfirmModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-describedby="confirm-description"
        aria-labelledby="confirm-title"
        aria-modal="true"
        className="confirm-modal"
        role="dialog"
      >
        <div>
          <p className="eyebrow">Confirmacao</p>
          <h2 id="confirm-title">{title}</h2>
          <p id="confirm-description">{description}</p>
        </div>

        <div className="modal-actions">
          <button className="ghost-button" onClick={onCancel} type="button">
            {cancelLabel}
          </button>
          <button
            className={variant === "danger" ? "danger-button" : "success-button"}
            onClick={onConfirm}
            type="button"
          >
            {actionLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
