import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/authSlice';

import {
  IconHome,
  IconLayoutDashboard,
  IconPackage,
  IconBuildingWarehouse,
  IconHanger,
  IconArrowBack,
  IconCreditCard,
  IconTrendingUp,
  IconUsers,
  IconIdBadge,
  IconDots,
  IconLogout,
} from '@tabler/icons-react';

const navSections = [
  {
    label: 'Overview',
    links: [
      { to: '/home',      label: 'Home',      icon: IconHome },
      { to: '/dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
    ],
  },
  {
    label: 'Commerce',
    links: [
      { to: '/orders',    label: 'Orders',    icon: IconPackage,           badge: 12 },
      { to: '/inventory', label: 'Inventory', icon: IconBuildingWarehouse },
      { to: '/products',  label: 'Products',  icon: IconHanger },
      { to: '/returns',   label: 'Returns',   icon: IconArrowBack,         badge: 3 },
    ],
  },
  {
    label: 'Finance',
    links: [
      { to: '/payments', label: 'Payments', icon: IconCreditCard },
      { to: '/sales',    label: 'Sales',    icon: IconTrendingUp },
    ],
  },
  {
    label: 'People',
    links: [
      { to: '/customer', label: 'Customers', icon: IconUsers },
      { to: '/staff',    label: 'Staff',     icon: IconIdBadge },
    ],
  },
];




function Tooltip({ label }) {


  
  return (
    <span
      className="
        absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-[999]
        bg-[#1a1a1a] text-white text-[12px] font-medium
        px-2.5 py-1.5 rounded-md whitespace-nowrap
        border border-white/10 pointer-events-none
        opacity-0 group-hover:opacity-100
        transition-opacity duration-150 delay-300
        before:content-[''] before:absolute before:-left-[5px] before:top-1/2
        before:-translate-y-1/2 before:border-4 before:border-transparent
        before:border-r-[#1a1a1a]
      "
    >
      {label}
    </span>
  );
}

export default function Sidebar() {
  const user = useSelector((state)=>state.auth.user);
  const supplier = useSelector((state)=> state.auth.extraDetails)
  
  const { pathname } = useLocation();
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const [hovered, setHovered] = useState(false);

  // Small delay before collapsing so accidental mouse-outs don't flicker
  const [open, setOpen] = useState(false);
  const timerRef = React.useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setOpen(false), 300);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative h-screen sticky top-0 shrink-0 z-40"
      style={{
        width: open ? '220px' : '64px',
        transition: 'width 280ms cubic-bezier(.4,0,.2,1)',
      }}
    >
      {/* Inner body */}
      <div className="absolute inset-0 bg-[#0f0f0f] flex flex-col overflow-hidden">

        {/* Brand */}
        <div className="flex items-center gap-3 px-[18px] py-[18px] border-b border-white/[0.08] shrink-0 min-w-[220px]">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shrink-0">
            <div className="w-3.5 h-3.5 bg-[#0f0f0f] rounded-sm" />
          </div>
          <span
            className="text-white font-semibold text-[15px] tracking-tight whitespace-nowrap"
            style={{
              opacity: open ? 1 : 0,
              transition: 'opacity 180ms ease',
              transitionDelay: open ? '80ms' : '0ms',
            }}
          >
            Codex
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 flex flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navSections.map(({ label, links }) => (
            <div key={label}>

              {/* Section label */}
              <div
                className="px-[18px] text-[10px] font-semibold tracking-widest text-white/30 uppercase whitespace-nowrap select-none overflow-hidden"
                style={{
                  height: open ? '28px' : '0px',
                  opacity: open ? 1 : 0,
                  paddingTop: open ? '10px' : '0',
                  paddingBottom: open ? '4px' : '0',
                  transition: 'height 200ms ease, opacity 150ms ease, padding 200ms ease',
                  transitionDelay: open ? '60ms' : '0ms',
                }}
              >
                {label}
              </div>

              {links.map(({ to, label: linkLabel, icon: Icon, badge }) => {
                const active = pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`
                      group relative flex items-center gap-2.5
                      min-w-[220px] transition-colors duration-150
                      ${active ? 'bg-white/[0.12]' : 'hover:bg-white/[0.07]'}
                    `}
                    style={{ padding: '7px 16px' }}
                  >
                    {/* Icon chip */}
                    <div
                      className={`
                        w-7 h-7 rounded-[7px] flex items-center justify-center
                        shrink-0 transition-colors duration-150
                        ${active ? 'bg-white' : 'bg-white/[0.06]'}
                      `}
                    >
                      <Icon
                        size={15}
                        stroke={1.75}
                        className={active ? 'text-[#0f0f0f]' : 'text-white/55'}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className={`text-[13px] font-medium flex-1 whitespace-nowrap ${active ? 'text-white' : 'text-white/55'}`}
                      style={{
                        opacity: open ? 1 : 0,
                        transition: 'opacity 150ms ease',
                        transitionDelay: open ? '60ms' : '0ms',
                      }}
                    >
                      {linkLabel}
                    </span>

                    {/* Badge */}
                    {badge !== undefined && (
                      <span
                        className="text-[11px] font-semibold bg-white text-[#0f0f0f] rounded-full px-1.5 leading-[18px] shrink-0"
                        style={{
                          opacity: open ? 1 : 0,
                          transition: 'opacity 150ms ease',
                          transitionDelay: open ? '80ms' : '0ms',
                        }}
                      >
                        {badge}
                      </span>
                    )}

                    {/* Tooltip — only when collapsed */}
                    {!open && <Tooltip label={linkLabel} />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/[0.08] py-2.5 shrink-0">

          {/* User row */}
          <div className="flex items-center gap-2.5 px-4 py-2 min-w-[220px] hover:bg-white/[0.06] cursor-pointer transition-colors duration-150">
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-white/10">
              <img
                src="https://api.dicebear.com/9.x/notionists/svg?seed=Alex&backgroundColor=b6e3f4"
                alt="Alex Johnson"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="flex-1 overflow-hidden"
              style={{
                opacity: open ? 1 : 0,
                transition: 'opacity 150ms ease',
                transitionDelay: open ? '60ms' : '0ms',
              }}
            >
              <p className="text-[12px] font-semibold text-white/85 truncate">{`${user.firstName} ${user.lastName}`}</p>
              <p className="text-[11px] text-white/35">{supplier.supplierName}</p>
            </div>
            <IconDots
              size={14}
              stroke={1.75}
              className="text-white/25 shrink-0"
              style={{
                opacity: open ? 1 : 0,
                transition: 'opacity 150ms ease',
                transitionDelay: open ? '80ms' : '0ms',
              }}
            />
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2.5 w-full px-4 py-2 min-w-[220px] text-white/35 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-150"
          >
            <IconLogout
              size={15}
              stroke={1.75}
              className="shrink-0 group-hover:text-red-400 transition-colors duration-150"
            />
            <span
              className="text-[13px] font-medium whitespace-nowrap group-hover:text-red-400 transition-[opacity,color] duration-0"
              style={{
                opacity: open ? 1 : 0,
                transitionDelay: open ? '60ms' : '0ms',
              }}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}