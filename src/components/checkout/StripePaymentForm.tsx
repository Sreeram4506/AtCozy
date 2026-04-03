import { useState } from 'react';
import { 
  useStripe, 
  useElements, 
  PaymentElement 
} from '@stripe/react-stripe-js';
import { toast } from 'sonner';

interface StripePaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onProcessing: (isProcessing: boolean) => void;
  amount: number;
}

export function StripePaymentForm({ onSuccess, onProcessing }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    onProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
      toast.error(error.message || 'Payment failed');
      onProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast.success('Payment authorized successfully');
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
        <label className="text-xs font-bold uppercase tracking-widest text-[#D4A24F] mb-4 block">
          Secure Payment Information
        </label>
        
        <PaymentElement 
          options={{
            layout: 'tabs',
          }} 
        />

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs">
            {errorMessage}
          </div>
        )}
      </div>

      <button
        id="submit-payment"
        type="button"
        onClick={handleSubmit}
        className="hidden" // This will be triggered by the main checkout form
      />
    </div>
  );
}
