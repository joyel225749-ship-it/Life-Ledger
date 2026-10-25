export default function StatCard({ label, value, subValue, foot, iconClass, icon: Icon }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className={`stat-icon ${iconClass}`}><Icon size={18} /></span>
      </div>
      <div className="stat-value">
        {value}
        {subValue && <small>{subValue}</small>}
      </div>
      <div className="stat-foot">{foot}</div>
    </article>
  );
}
