import React from 'react';
import {  logoutUser } from '../store/authSlice';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const navLinks = [
  {  },
  {     },
];

export default function Header() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  return (
    <div className="h-full w-full bg-white border-b border-gray-200 flex items-center px-6 gap-6">

      {/* Brand */}
      <div className="flex-shrink-0">
        <span className="text-2xl font-semibold tracking-tight">Codex</span>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-200" />

      {/* Nav links */}
      <nav className="flex items-center gap-2 flex-1">
        {navLinks.map(({ to, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition
                ${active
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="px-4 py-2 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition"
      >
        Logout
      </button>
    </div>
  );
}