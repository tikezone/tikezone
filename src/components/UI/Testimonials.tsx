'use client';

import React from 'react';
import { Star, Quote, MessageCircle } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Awa K.',
      role: 'Participante',
      avatar: '👩🏾',
      rating: 5,
      text: 'Super simple à utiliser ! J\'ai eu mes tickets en 2 minutes, et le QR code a fonctionné parfaitement à l\'entrée.',
      color: 'from-brand-100 to-pink-100',
    },
    {
      name: 'Moussa D.',
      role: 'Organisateur',
      avatar: '👨🏾',
      rating: 5,
      text: 'Depuis que j\'utilise Tikezone, mes ventes ont augmenté de 40%. Le scan à l\'entrée, c\'est vraiment le top !',
      color: 'from-yellow-100 to-orange-100',
    },
    {
      name: 'Fatou S.',
      role: 'Participante',
      avatar: '👩🏾‍🦱',
      rating: 5,
      text: 'J\'adore pouvoir garder mes tickets sur mon téléphone même sans internet. Plus besoin d\'imprimer !',
      color: 'from-green-100 to-emerald-100',
    },
    {
      name: 'Koné B.',
      role: 'Organisateur',
      avatar: '👨🏾‍🦲',
      rating: 5,
      text: 'Le support client est incroyable. Ils m\'ont aidé à configurer mon premier événement en moins d\'une heure.',
      color: 'from-blue-100 to-cyan-100',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-yellow-50 via-orange-50 to-brand-50 border-b-4 border-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border-3 border-black rounded-full shadow-[4px_4px_0_rgba(0,0,0,1)] mb-4">
            <MessageCircle size={18} className="text-brand-500" />
            <span className="text-sm font-black uppercase tracking-wide">Témoignages</span>
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-900 mb-4">
            Ce qu'ils disent de nous
          </h2>
          <p className="text-lg text-slate-600 font-bold max-w-2xl mx-auto">
            Des milliers de clients satisfaits utilisent Tikezone chaque jour.
          </p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={24} className="text-yellow-400 fill-current" strokeWidth={2} />
              ))}
            </div>
            <span className="text-2xl font-black text-slate-900">4.9/5</span>
            <span className="text-sm font-bold text-slate-500">(2,847 avis)</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${testimonial.color} border-4 border-black rounded-3xl p-6 shadow-[5px_5px_0_rgba(0,0,0,1)] hover:shadow-[7px_7px_0_rgba(0,0,0,1)] hover:-translate-y-2 transition-all duration-300`}
              style={{ transform: `rotate(${index % 2 === 0 ? 1 : -1}deg)` }}
            >
              <Quote size={24} className="text-slate-400 mb-4" />
              
              <p className="text-sm font-bold text-slate-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white border-3 border-black rounded-full flex items-center justify-center text-2xl shadow-[2px_2px_0_rgba(0,0,0,1)]">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-black text-slate-900">{testimonial.name}</div>
                  <div className="text-xs font-bold text-slate-600">{testimonial.role}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
