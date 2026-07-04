import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '../lib/support';

/**
 * Floating "chat on WhatsApp" help button, bottom-right on every page.
 * Renders only once WHATSAPP_NUMBER is set in lib/support.ts.
 */
export function WhatsAppButton() {
  const link = whatsappLink();
  if (!link) return null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#1ebe5b] active:scale-95"
    >
      <MessageCircle size={26} fill="currentColor" />
    </a>
  );
}
