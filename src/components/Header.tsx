'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, BookOpen, Scale, Database, HelpCircle, BookMarked } from 'lucide-react';

export function Header() {
  const pathname = usePathname() || '/';

  const navLinks = [
    { href: '/', label: 'Explore', icon: Search },
    { href: '/compare', label: 'Compare', icon: Scale },
    { href: '/notebook', label: 'Notebook', icon: BookMarked },
    { href: '/sources', label: 'Sources', icon: Database },
    { href: '/what-is-drug-repurposing', label: 'Guide', icon: BookOpen },
    { href: '/methodology', label: 'Methodology', icon: Scale },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo & Brand Wordmark */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-left focus-visible:ring-2 focus-visible:ring-teal-400 rounded-sm cursor-pointer group"
            aria-label="Repurpose Home"
          >
            <Image
              src="/icon.svg"
              alt="Repurpose Logo"
              width={26}
              height={26}
              className="w-6.5 h-6.5 rounded-md shadow-xs transition-transform group-hover:scale-105"
              priority
            />
            <span className="font-semibold text-lg tracking-tight text-white">
              Repurpose
            </span>
          </Link>
        </div>

        {/* Desktop Navigation (Crawlable HTML Links) */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-teal-300 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Bottom Navigation Bar (Crawlable HTML Links) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-40 px-2 py-1 flex items-center justify-around">
        {navLinks.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center touch-target py-1 px-2.5 rounded text-[11px] font-medium ${
                isActive ? 'text-teal-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/about"
          className={`flex flex-col items-center justify-center touch-target py-1 px-2.5 rounded text-[11px] font-medium ${
            pathname === '/about' ? 'text-teal-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4 mb-0.5" />
          <span>About</span>
        </Link>
      </div>
    </header>
  );
}
