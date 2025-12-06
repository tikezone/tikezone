'use client';

import React from 'react';
import { Link } from '../../lib/safe-navigation';
import { Phone, Mail, MapPin, Heart, Sparkles } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 border-t-4 border-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="text-3xl font-black tracking-tight font-display">
                TIKE<span className="text-brand-400">ZONE</span>
              </span>
            </Link>
            <p className="text-sm font-medium leading-relaxed text-slate-400 mb-6">
              La billetterie la plus fun d'Afrique ! Réservez vos places en deux clics et vivez des expériences de dingue. 🎉
            </p>
            <div className="flex gap-3">
              {[
                { icon: '📱', href: 'https://wa.me/2250700000000', label: 'WhatsApp', color: 'from-green-400 to-emerald-500' },
                { icon: '📘', href: '#', label: 'Facebook', color: 'from-blue-500 to-blue-600' },
                { icon: '📸', href: '#', label: 'Instagram', color: 'from-pink-500 to-purple-500' },
                { icon: '🐦', href: '#', label: 'Twitter', color: 'from-cyan-400 to-blue-400' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className={`w-10 h-10 bg-gradient-to-br ${social.color} border-2 border-black rounded-xl flex items-center justify-center text-lg shadow-[2px_2px_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-all`}
                  title={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="inline-flex items-center gap-2 font-black text-base mb-6 uppercase tracking-wider px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 border-2 border-black rounded-lg shadow-[2px_2px_0_rgba(0,0,0,1)] transform -rotate-1">
              <Sparkles size={14} />
              Produit
            </h3>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/explore" className="text-slate-400 hover:text-white transition-colors">Tous les événements</Link></li>
              <li><Link href="/how-it-works" className="text-slate-400 hover:text-white transition-colors">Comment ça marche</Link></li>
              <li><Link href="/publish" className="text-slate-400 hover:text-white transition-colors">Publier un événement</Link></li>
              <li><Link href="/explore?category=festival" className="text-slate-400 hover:text-white transition-colors">Festivals</Link></li>
              <li><Link href="/explore?category=concert" className="text-slate-400 hover:text-white transition-colors">Concerts</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="inline-flex items-center gap-2 font-black text-base mb-6 uppercase tracking-wider px-3 py-1 bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-900 border-2 border-black rounded-lg shadow-[2px_2px_0_rgba(0,0,0,1)] transform rotate-1">
              📋 Légal
            </h3>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Conditions générales</Link></li>
              <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Politique de confidentialité</Link></li>
              <li><Link href="/cookies" className="text-slate-400 hover:text-white transition-colors">Cookies</Link></li>
              <li><Link href="/refunds" className="text-slate-400 hover:text-white transition-colors">Remboursements</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="inline-flex items-center gap-2 font-black text-base mb-6 uppercase tracking-wider px-3 py-1 bg-gradient-to-r from-brand-400 to-pink-400 text-white border-2 border-black rounded-lg shadow-[2px_2px_0_rgba(0,0,0,1)] transform -rotate-1">
              💬 Aide
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0_rgba(0,0,0,1)]">
                  <Phone size={14} className="text-white" strokeWidth={3} />
                </div>
                <span className="font-bold text-slate-300">+225 07 00 00 00 00</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0_rgba(0,0,0,1)]">
                  <Mail size={14} className="text-white" strokeWidth={3} />
                </div>
                <span className="font-bold text-slate-300">support@tikezone.com</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-pink-500 rounded-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0_rgba(0,0,0,1)]">
                  <MapPin size={14} className="text-white" strokeWidth={3} />
                </div>
                <span className="font-bold text-slate-300">Abidjan, Côte d'Ivoire 🇨🇮</span>
              </li>
            </ul>
            <Link href="/support" className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-black text-sm uppercase tracking-wide border-2 border-black rounded-xl shadow-[3px_3px_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
              Nous contacter
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
              <span>&copy; {new Date().getFullYear()}</span>
              <span className="text-brand-400">NEX Group Côte d'Ivoire</span>
              <span>–</span>
              <span>Tikezone</span>
              <Heart size={14} className="text-brand-400 fill-current mx-1" />
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
              <Link href="/terms" className="hover:text-white transition-colors">Mentions légales</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
              <Link href="/terms" className="hover:text-white transition-colors">CGV</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
