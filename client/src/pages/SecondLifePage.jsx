import { Leaf, Wrench, RefreshCw, Gift, Recycle } from 'lucide-react';

const guides = [
  {
    icon: Wrench,
    title: 'Repair first',
    color: 'mint',
    tips: [
      'Check the manufacturer\'s website for authorised service centres.',
      'Search iFixit.com for free step-by-step repair guides for electronics.',
      'For small appliances, local repair shops are often cheaper than brand service centres.',
      'Ask if spare parts are available before deciding to replace.',
    ],
  },
  {
    icon: RefreshCw,
    title: 'Resell or trade in',
    color: 'sky',
    tips: [
      'List on OLX, Quikr, or Facebook Marketplace for direct buyers.',
      'Try manufacturer or retailer trade-in programmes (e.g., Apple, Samsung, Croma).',
      'Ensure you wipe personal data completely before selling any device.',
      'Include original packaging and accessories to get a better price.',
    ],
  },
  {
    icon: Gift,
    title: 'Donate',
    color: 'lavender',
    tips: [
      'Contact local NGOs or schools — many accept working electronics, furniture, and clothing.',
      'Goonj (goonj.org) accepts a wide range of household items across India.',
      'Confirm the organisation can use the item before donating.',
    ],
  },
  {
    icon: Recycle,
    title: 'Recycle responsibly',
    color: 'peach',
    tips: [
      'Search for e-waste drop-off points on the manufacturer\'s website.',
      'In India, check the E-Waste (Management) Rules 2022 for extended producer responsibility.',
      'Never throw electronics, batteries, or chemicals in regular bins.',
      'We do not list specific local recyclers as availability changes — please verify through official channels.',
    ],
    disclaimer: true,
  },
];

export default function SecondLifePage() {
  return (
    <div className="content">
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><Leaf size={14} /> SECOND-LIFE GUIDE</div>
          <h1>Give products a second life</h1>
          <p className="subtitle">Practical guidance on repair, resale, donation, and responsible recycling.</p>
        </div>
      </div>

      <div className="form-error" style={{ background: '#fffbe6', borderColor: '#ffe58f', color: '#7c5c00', marginBottom: 24 }}>
        ⚠️ This is general guidance only. We do not endorse specific services and cannot verify local availability. Always confirm details independently.
      </div>

      <div className="second-life-grid">
        {guides.map(({ icon: Icon, title, color, tips, disclaimer }) => (
          <section className="passport-card" key={title}>
            <div className={`product-art ${color}`} style={{ height: 70, borderRadius: 10, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={28} />
            </div>
            <h2 style={{ fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 800, marginBottom: 12 }}>{title}</h2>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {tips.map((t, i) => <li key={i} style={{ fontSize: 13, lineHeight: 1.7, color: '#48495f', marginBottom: 6 }}>{t}</li>)}
            </ul>
            {disclaimer && (
              <p style={{ fontSize: 11, color: '#9293a8', marginTop: 12, fontStyle: 'italic' }}>
                Local recycler listings change frequently. We recommend searching official manufacturer or government sources.
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
