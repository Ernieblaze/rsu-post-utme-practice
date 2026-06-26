import PaystackPop from '@paystack/inline-js';

interface StartPaymentArgs {
  email: string;
  userId: string;
  amountKobo: number;
  onSuccess: (reference: string) => void;
  onCancel?: () => void;
  onError?: (message: string) => void;
}

export function startPaystackPayment({
  email,
  userId,
  amountKobo,
  onSuccess,
  onCancel,
  onError,
}: StartPaymentArgs): void {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error('Missing required environment variable: VITE_PAYSTACK_PUBLIC_KEY');
  }

  const popup = new PaystackPop();
  popup.newTransaction({
    key: publicKey,
    email,
    amount: amountKobo,
    currency: 'NGN',
    metadata: {
      user_id: userId,
    },
    onSuccess: (transaction) => {
      onSuccess(transaction.reference);
    },
    onCancel: () => {
      if (onCancel) onCancel();
    },
    onError: (error) => {
      if (onError) onError(error.message);
    },
  });
}
