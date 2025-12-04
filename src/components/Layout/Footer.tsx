
'use client';

import React from 'react';
import { Link } from '../../lib/safe-navigation';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t-4 border-black text-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-black">
          
          {/* Brand Column */}
          <div className="p-8 lg:p-10 space-y-6">
            <div className="flex items-center">
              <span className="text-2xl font-black tracking-tight text-slate-900 font-display">
                TIKE<span className="text-brand-500">ZONE</span>
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-600">
              La billetterie la plus fun d'Afrique ! Réservez vos places en deux clics et vivez des expériences de dingue.
            </p>
            <div className="flex space-x-3 pt-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="p-2 bg-slate-100 rounded-lg border-2 border-black hover:bg-brand-100 hover:shadow-pop-sm transition-all active:translate-y-0.5 active:shadow-none">
                  <Icon size={18} strokeWidth={2.5} className="text-black" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="p-8 lg:p-10">
            <h3 className="font-black text-lg mb-6 uppercase tracking-wider bg-yellow-300 inline-block px-2 border-2 border-black shadow-pop-sm transform -rotate-1">Découvrir</h3>
            <ul className="space-y-3 text-sm font-bold text-slate-700">
              <li><Link href="/explore" className="hover:text-brand-600 hover:underline decoration-2 underline-offset-2">Tous les événements</Link></li>
              <li><Link href="/how-it-works" className="hover:text-brand-600 hover:underline decoration-2 underline-offset-2">Comment ça marche</Link></li>
              <li><Link href="/faq" className="hover:text-brand-600 hover:underline decoration-2 underline-offset-2">FAQ / Aide</Link></li>
              <li><Link href="/explore?category=festival" className="hover:text-brand-600 hover:underline decoration-2 underline-offset-2">Festivals</Link></li>
              <li><Link href="/gift-cards" className="hover:text-brand-600 hover:underline decoration-2 underline-offset-2 text-brand-600">Carte CADEAU 🔥</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="p-8 lg:p-10">
            <h3 className="font-black text-lg mb-6 uppercase tracking-wider bg-cyan-300 inline-block px-2 border-2 border-black shadow-pop-sm transform rotate-1">Organisateurs</h3>
            <ul className="space-y-3 text-sm font-bold text-slate-700">
              <li><Link href="/publish" className="hover:text-brand-600 hover:underline decoration-2 underline-offset-2">Publier un événement</Link></li>
              <li><Link href="/organizer" className="hover:text-brand-600 hover:underline decoration-2 underline-offset-2">Solutions Pro</Link></li>
              <li><Link href="/contact" className="hover:text-brand-600 hover:underline decoration-2 underline-offset-2">Devenir Partenaire</Link></li>
              <li><Link href="/terms" className="hover:text-brand-600 hover:underline decoration-2 underline-offset-2">Conditions Générales</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="p-8 lg:p-10 bg-slate-50">
            <h3 className="font-black text-lg mb-6 uppercase tracking-wider">Aide & Contact</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center mr-3 shrink-0">
                   <Phone size={14} className="text-black" strokeWidth={2.5} />
                </div>
                +225 07 00 00 00 00
              </li>
              <li className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center mr-3 shrink-0">
                   <Mail size={14} className="text-black" strokeWidth={2.5} />
                </div>
                support@tikezone.com
              </li>
              <li className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center mr-3 shrink-0">
                   <MapPin size={14} className="text-black" strokeWidth={2.5} />
                </div>
                Abidjan, Côte d'Ivoire
              </li>
            </ul>
            <Link href="/contact">
                <button className="mt-4 w-full bg-slate-900 text-white font-black py-2 rounded-lg border-2 border-black shadow-sm active:translate-y-[1px] active:shadow-none transition-all text-xs uppercase tracking-wide">
                    Nous contacter
                </button>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-2 border-black bg-black text-white p-6 flex flex-col md:flex-row justify-between items-center text-xs font-bold uppercase tracking-wide">
          <p>&copy; {new Date().getFullYear()} Tikezone Inc. Tous droits réservés.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-brand-300 transition-colors">Mentions légales</Link>
            <Link href="/terms" className="hover:text-brand-300 transition-colors">Confidentialité</Link>
            <Link href="/terms" className="hover:text-brand-300 transition-colors">CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
