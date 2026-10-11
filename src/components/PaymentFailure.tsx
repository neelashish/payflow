import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, RotateCcw, Home } from 'lucide-react';

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const reason = searchParams.get('reason') || 'Payment could not be completed';
  const prId = searchParams.get('pr');

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Payment Failed</h1>
          <p className="text-zinc-600 mb-6">{reason}</p>
          
          <div className="bg-zinc-50 rounded-lg p-4 mb-6 text-left border border-zinc-100">
            <p className="text-sm text-zinc-700 font-medium mb-2">What happened?</p>
            <ul className="text-sm text-zinc-600 space-y-1">
              <li>• Your payment was not processed</li>
              <li>• No amount has been debited from your account</li>
              <li>• If amount was debited, it will be refunded within 5-7 business days</li>
              <li>• No receipt has been generated for this transaction</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="btn-primary w-full"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary w-full"
            >
              <Home className="w-4 h-4" />
              Return to Home
            </button>
          </div>

          {prId && (
            <p className="text-xs text-zinc-400 mt-4 font-mono">
              Ref: {prId.substring(0, 8)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
