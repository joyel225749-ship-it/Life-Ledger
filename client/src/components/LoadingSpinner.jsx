export default function LoadingSpinner({ message = 'Loading…' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" aria-label="Loading" />
      <p className="spinner-msg">{message}</p>
    </div>
  );
}
