interface ValidationErrorProps {
  message: String;
  action: String;
  statusCode?: number;
  errorLocationCode?: String;
}

export function ValidationError({
  message,
  action,
  statusCode,
  errorLocationCode,
}: ValidationErrorProps) {
  return {
    message: message || "Um erro de validação ocorreu.",
    action: action || "Ajuste os dados enviados e tente novamente.",
    statusCode: statusCode || 400,
    errorLocationCode: errorLocationCode,
  };
}
