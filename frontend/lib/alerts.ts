import Swal from "sweetalert2";

/**
 * Helpers centralizados de SweetAlert2, usados en vez de `window.confirm`/`alert`
 * nativos en toda la app (CRUDs del panel de administración).
 */

interface ConfirmOptions {
  title?: string;
  text: string;
  confirmButtonText?: string;
}

export async function confirmAction({
  title = "¿Estás seguro?",
  text,
  confirmButtonText = "Sí, continuar",
}: ConfirmOptions): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export function showErrorAlert(text: string, title = "Error"): void {
  Swal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "Entendido",
    confirmButtonColor: "#dc2626",
  });
}
