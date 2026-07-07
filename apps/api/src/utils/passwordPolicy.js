import { AppError } from "./appError.js";

const weakPasswords = new Set([
  "123456",
  "12345678",
  "password",
  "senha",
  "admin123",
  "qwerty123"
]);

export function validatePasswordPolicy(password) {
  const value = password ?? "";

  if (value.length < 8) {
    throw new AppError("A senha deve ter pelo menos 8 caracteres.", 400);
  }

  if (weakPasswords.has(value.toLowerCase())) {
    throw new AppError("Escolha uma senha menos previsivel.", 400);
  }
}
