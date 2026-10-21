import { useNavigate } from 'react-router';
import { Scissors, Users, Package, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp, UserRole } from '../context/AppContext';

const C = { primary: '#C4623F', dark: '#1A2B3C', teal: '#2A9D8F', bg: '#F5F0E8' };

const ROLES = [
  {
    id: 'customer' as UserRole,
    icon: <Users size={28} />,
    label: 'Customer',
    tagline: 'Find & Book Tailors',
    desc: 'Browse expert tailors, order fabrics, and manage your custom clothing projects with ease.',
    color: C.teal,
    perks: ['Discover verified tailors', 'Track your projects live', 'Secure online payment'],
  },
  {
    id: 'tailor' as UserRole,
    icon: <Scissors size={28} />,
    label: 'Tailor',
    tagline: 'Grow Your Business',
    desc: 'Showcase your work, manage bookings, source quality fabrics, and grow your tailoring practice.',
    color: C.primary,
    perks: ['Professional dashboard', 'Job & schedule management', 'Portfolio showcase'],
  },
  {
    id: 'seller' as UserRole,
    icon: <Package size={28} />,
    label: 'Fabric Seller',
    tagline: 'Sell to More Clients',
    desc: 'List your fabric inventory, process orders, and connect with tailors across the Philippines.',
    color: C.dark,
    perks: ['Sales analytics', 'Order management', 'Inventory tracking'],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setUserRole } = useApp();

  const handleSelect = (role: UserRole) => {
    setUserRole(role);
    navigate('/auth/signup');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="p-6 flex items-center justify-between max-w-4xl mx-auto w-full">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.primary }}>
            <Scissors size={14} className="text-white" />
          </div>
          <span style={{ color: C.dark, fontFamily: "'Playfair Display', serif" }}>SewsEra</span>
        </div>
        <button onClick={() => navigate('/auth/login')} className="text-sm" style={{ color: C.primary }}>
          Sign In
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-4xl mb-3" style={{ color: C.dark, fontFamily: "'Playfair Display', serif" }}>
            How will you use SewsEra?
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Choose your role to get a personalized experience tailored to your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 w-full max-w-3xl">
          {ROLES.map(r => (
            <button
              key={r.id}
              onClick={() => handleSelect(r.id)}
              className="group relative bg-white rounded-2xl p-6 text-left border-2 border-transparent hover:border-current transition-all shadow-sm hover:shadow-md"
              style={{ '--hover-color': r.color } as React.CSSProperties}
              onMouseEnter={e => (e.currentTarget.style.borderColor = r.color)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4" style={{ background: r.color }}>
                {r.icon}
              </div>
              <p className="text-xs mb-1" style={{ color: r.color }}>{r.tagline}</p>
              <h3 className="text-xl mb-2" style={{ color: C.dark }}>{r.label}</h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">{r.desc}</p>
              <ul className="space-y-1.5 mb-5">
                {r.perks.map(p => (
                  <li key={p} className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: r.color }}>
                      ✓
                    </div>
                    {p}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-1.5 text-sm" style={{ color: r.color }}>
                <span>Continue as {r.label}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-8 text-center">
          By continuing, you agree to SewsEra's{' '}
          <a href="#" className="underline" style={{ color: C.primary }}>Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="underline" style={{ color: C.primary }}>Privacy Policy</a>.
        </p>
      </main>
    </div>
  );
}
