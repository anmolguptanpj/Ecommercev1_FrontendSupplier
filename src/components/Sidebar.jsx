import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/orders',    label: 'Orders',    icon: '📦' },
  { to: '/payments',  label: 'Payments',  icon: '💳' },
  { to: '/customer',  label: 'Customers', icon: '👤' },
  { to: '/returns',   label: 'Returns',   icon: '↩️'  },
  { to: '/sales',     label: 'Sales',     icon: '📈' },
  { to: '/staff',     label: 'Staff',     icon: '🧑‍💼' },
  { to: '/products',  label: 'Products',  icon: '🛍️'  },
  { to: '/inventory', label: 'Inventory', icon: '🗃️'  },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-56 shrink-0">



      {/* Nav Links */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {navLinks.map(({ to, label, icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition
                ${active
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}