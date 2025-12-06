'use client';

import React from 'react';
import { Link } from '../../lib/safe-navigation';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-16">
          <div className="space-y-6">
            <div className="flex items-center">
              <span className="text-2xl font-black tracking-tight font-display">
                TIKE<span className="text-brand-500">ZONE</span>
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              La billetterie la plus moderne d'Afrique. Reservez vos places en quelques clics et vivez des experiences inoubliables.
            </p>
            <div className="flex space-x-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                  <Icon size={18} className="text-white/50 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Decouvrir</h3>
            <ul className="space-y-3">
              {[
                { label: 'Comment ca marche', href: '/how-it-works' },
                { label: 'FAQ / Aide', href: '/faq' },
                { label: 'Carte Cadeau', href: '/gift-cards', highlight: true },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={`text-sm font-medium transition-colors flex items-center group ${item.highlight ? 'text-brand-400 hover:text-brand-300' : 'text-white/50 hover:text-white'}`}>
                    {item.label}
                    <ArrowUpRight size={14} className="ml-1 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Organisateurs</h3>
            <ul className="space-y-3">
              {[
                { label: 'Publier un evenement', href: '/publish' },
                { label: 'Solutions Pro', href: '/organizer' },
                { label: 'Devenir Partenaire', href: '/contact' },
                { label: 'Conditions Generales', href: '/terms' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm font-medium text-white/50 hover:text-white transition-colors flex items-center group">
                    {item.label}
                    <ArrowUpRight size={14} className="ml-1 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-sm text-white/50">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mr-3 shrink-0">
                  <Phone size={16} className="text-brand-400" />
                </div>
                +225 07 00 00 00 00
              </li>
              <li className="flex items-center text-sm text-white/50">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mr-3 shrink-0">
                  <Mail size={16} className="text-brand-400" />
                </div>
                support@tikezone.com
              </li>
              <li className="flex items-center text-sm text-white/50">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mr-3 shrink-0">
                  <MapPin size={16} className="text-brand-400" />
                </div>
                Abidjan, Cote d'Ivoire
              </li>
            </ul>
            <Link href="/contact">
              <button className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all text-sm">
                Nous contacter
              </button>
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/30">&copy; {new Date().getFullYear()} Tikezone. Tous droits reserves.</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/30">
            <Link href="/terms" className="hover:text-white transition-colors">Mentions legales</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Confidentialite</Link>
            <Link href="/terms" className="hover:text-white transition-colors">CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
