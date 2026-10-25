import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle size={20} />
      <span>{message || 'Something went wrong.'}</span>
      {onRetry && <button className="text-button" onClick={onRetry}>Try again</button>}
    </div>
  );
}
