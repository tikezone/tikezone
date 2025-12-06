'use client';

import React from 'react';
import { Link } from '../../lib/safe-navigation';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 py-12 lg:py-16">
          
          <div className="space-y-6">
            <div className="flex items-center">
              <span className="text-2xl font-black tracking-tight text-white">
                TIKE<span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">ZONE</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              La billetterie la plus fun d'Afrique ! Reservez vos places en deux clics et vivez des experiences de dingue.
            </p>
            <div className="flex space-x-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="p-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white/10 hover:scale-110 active:scale-95 transition-all duration-300">
                  <Icon size={16} className="text-gray-400 hover:text-white transition-colors" strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-6">Decouvrir</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/how-it-works" className="text-gray-400 hover:text-orange-400 transition-colors">Comment ca marche</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-orange-400 transition-colors">FAQ / Aide</Link></li>
              <li><Link href="/gift-cards" className="text-orange-400 hover:text-orange-300 transition-colors">Carte CADEAU</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-6">Organisateurs</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/publish" className="text-gray-400 hover:text-orange-400 transition-colors">Publier un evenement</Link></li>
              <li><Link href="/organizer" className="text-gray-400 hover:text-orange-400 transition-colors">Solutions Pro</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-orange-400 transition-colors">Devenir Partenaire</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-orange-400 transition-colors">Conditions Generales</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-6">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center text-gray-400">
                <div className="w-9 h-9 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center mr-3 shrink-0">
                  <Phone size={14} className="text-gray-500" strokeWidth={2} />
                </div>
                +225 07 00 00 00 00
              </li>
              <li className="flex items-center text-gray-400">
                <div className="w-9 h-9 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center mr-3 shrink-0">
                  <Mail size={14} className="text-gray-500" strokeWidth={2} />
                </div>
                support@tikezone.com
              </li>
              <li className="flex items-center text-gray-400">
                <div className="w-9 h-9 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center mr-3 shrink-0">
                  <MapPin size={14} className="text-gray-500" strokeWidth={2} />
                </div>
                Abidjan, Cote d'Ivoire
              </li>
            </ul>
            <Link href="/contact">
              <button className="mt-6 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-full hover:scale-105 active:scale-95 transition-all duration-300 text-sm shadow-glow">
                Nous contacter
              </button>
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Tikezone Inc. Tous droits reserves.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
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