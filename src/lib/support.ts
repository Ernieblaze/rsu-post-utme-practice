/**
 * Support / contact details shown across the app.
 *
 * WHATSAPP_NUMBER: your WhatsApp Business number in INTERNATIONAL format,
 * digits only — no "+", spaces, or leading zero.
 *   Nigeria example: 08012345678  →  2348012345678
 *
 * Leave it as an empty string to hide the floating WhatsApp button until
 * the number is ready.
 */
export const WHATSAPP_NUMBER = '2347051925741';

export const SUPPORT_EMAIL = 'rsupostutmepractice@gmail.com';

/** Pre-filled message when a student opens WhatsApp from the app. */
export const WHATSAPP_DEFAULT_MESSAGE =
  'Hi, I need help with the RSU Post-UTME Practice app.';

export function whatsappLink(): string | null {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`;
}
