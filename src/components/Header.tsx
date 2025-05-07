'use client';

import { useEffect, useState } from 'react';

interface HeaderProps {
  isConnected: boolean;
  account?: string;
  isStaff: boolean;
  staffName?: string;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Header({
  isConnected,
  account,
  isStaff,
  staffName,
  onLogin,
  onLogout,
}: HeaderProps) {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-gray-900 text-white py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <span className="font-bold text-xl">🎬 Film Rental Dapp</span>
        <span className="text-sm text-gray-300">{dateTime.toLocaleString()}</span>
      </div>
      <nav className="flex items-center gap-4">
        {isStaff && (
          <a
            href="/add-film"
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition"
          >
            Add Film
          </a>
        )}
        {isConnected ? (
          <span className="text-green-400">
            {isStaff ? `Staff: ${staffName}` : `Wallet: ${account?.slice(0, 6)}...${account?.slice(-4)}`}
          </span>
        ) : null}
        {isConnected || isStaff ? (
          <button
            onClick={onLogout}
            className="ml-2 px-3 py-1 rounded bg-red-600 hover:bg-red-700 transition"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={onLogin}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition"
          >
            Login
          </button>
        )}
      </nav>
    </header>
  );
}