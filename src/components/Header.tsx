'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  BookOpen, 
  Scale, 
  Database, 
  HelpCircle, 
  BookMarked, 
  Newspaper, 
  Compass, 
  Menu, 
  X, 
  ShieldAlert, 
  FileCode,
  ChevronRight
} from 'lucide-react';

export function Header() {
  const pathname = usePathname() || '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const navLinks = [
    { href: '/', label: 'Explore', icon: Search },
    { href: '/compare', label: 'Compare', icon: Scale },
    { href: '/notebook', label: 'Notebook', icon: BookMarked },
    { href: '/news', label: 'News', icon: Newspaper },
    { href: '/sources', label: 'Sources', icon: Database },
    { href: '/what-is-drug-repurposing', label: 'Guide', icon: BookOpen },
    { href: '/methodology', label: 'Methodology', icon: Compass },
    { href: '/about', label: 'About & Privacy', icon: HelpCircle },
  ];

  const mobilePrimaryLinks = [
    { href: '/', label: 'Explore', icon: Search },
    { href: '/compare', label: 'Compare', icon: Scale },
    { href: '/notebook', label: 'Notebook', icon: BookMarked },
    { href: '/news', label: 'News', icon: Newspaper },
  ];

  const menuSections = [
    {
      title: 'Evidence & Architecture',
      items: [
        {
          href: '/methodology',
          label: 'Methodology',
          description: 'Repurpose Compass™ 100-point scoring breakdown',
          icon: Compass,
        },
        {
          href: '/sources',
          label: 'Data Sources & Registry',
          description: 'NIH, FDA, and PubMed API boundaries',
          icon: Database,
        },
        {
          href: '/what-is-drug-repurposing',
          label: 'Educational Guide',
          description: 'What is Drug Repurposing & computational methods',
          icon: BookOpen,
        },
      ],
    },
    {
      title: 'About, Governance & Legal',
      items: [
        {
          href: '/about',
          label: 'About & Privacy',
          description: 'Mission, principles & creator attribution',
          icon: HelpCircle,
        },
        {
          href: '/terms-privacy-disclaimer',
          label: 'Terms & Disclaimer',
          description: 'Legal terms, research disclosures & medical disclaimer',
          icon: ShieldAlert,
        },
        {
          href: '/license',
          label: 'Open-Source MIT License',
          description: 'MIT License terms, copyright & source permissions',
          icon: FileCode,
        },
      ],
    },
  ];

  // Check if current route is one of the menu drawer routes
  const isMenuRouteActive = [
    '/methodology',
    '/sources',
    '/what-is-drug-repurposing',
    '/about',
    '/terms-privacy-disclaimer',
    '/license',
    '/privacy',
  ].some((r) => pathname === r || (r !== '/' && pathname.startsWith(r)));

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 fixed top-0 left-0 right-0 z-50">
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
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
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

      {/* Mobile Bottom Navigation Bar with Three-Horizontal-Lines Menu Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-40 px-2 py-1 flex items-center justify-around">
        {mobilePrimaryLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/news' && pathname.startsWith('/news'));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center touch-target py-1 px-2.5 rounded text-[11px] font-medium transition-colors ${
                isActive ? 'text-teal-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Menu Button (Three Horizontal Lines) */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
          className={`flex flex-col items-center justify-center touch-target py-1 px-2.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            isMenuOpen || isMenuRouteActive ? 'text-teal-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="relative w-4 h-4 mb-0.5 flex items-center justify-center">
            <Menu className={`w-4 h-4 absolute inset-0 transition-all duration-300 transform ${isMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`} />
            <X className={`w-4 h-4 absolute inset-0 transition-all duration-300 transform ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`} />
          </span>
          <span>Menu</span>
        </button>
      </div>

      {/* Mobile Slide-Over Menu Sheet */}
      <div 
        className={`md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/40 backdrop-blur-xs transition-[opacity,visibility] duration-300 ease-in-out ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden={!isMenuOpen}
      >
        <div 
          className={`w-full bg-white border-t border-slate-200 rounded-t-2xl shadow-2xl p-5 pb-20 max-h-[85vh] overflow-y-auto space-y-5 text-slate-900 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isMenuOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top grab handle */}
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto -mt-1 mb-1" aria-hidden="true" />

          {/* Drawer Top Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Image
                src="/icon.svg"
                alt="Repurpose"
                width={22}
                height={22}
                className="w-5.5 h-5.5 rounded-md shadow-2xs"
              />
              <span className="font-bold text-sm text-slate-900">
                Workspace Menu
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Links by Section */}
          {menuSections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
                {sec.title}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all border ${
                        isActive
                          ? 'bg-teal-50 text-teal-950 border-teal-300 ring-1 ring-teal-400/20 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 pr-2">
                        <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className={`text-xs font-bold ${isActive ? 'text-teal-950' : 'text-slate-900'}`}>
                            {item.label}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
