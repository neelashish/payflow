import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const reason = searchParams.get('reason') || 'Payment could not be completed';
  const prId = searchParams.get('pr');

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/50 border-2 border-red-700 mb-4">
            <i className="fas fa-times text-3xl text-red-400"></i>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">Payment Failed</h1>
          <p className="text-slate-400 mb-6">{reason}</p>
          
          <div className="bg-slate-900/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-slate-400 mb-2">What happened?</p>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Your payment was not processed</li>
              <li>• No amount has been debited from your account</li>
              <li>• If amount was debited, it will be refunded within 5-7 business days</li>
              <li>• No receipt has been generated for this transaction</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
            >
              <i className="fas fa-redo mr-2"></i>
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-6 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition"
            >
              <i className="fas fa-home mr-2"></i>
              Return to Home
            </button>
          </div>

          {prId && (
            <p className="text-xs text-slate-500 mt-4">
              Reference: {prId.substring(0, 8)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
