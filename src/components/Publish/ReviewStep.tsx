import React from 'react';
import { CheckCircle, Calendar, MapPin } from 'lucide-react';

interface ReviewStepProps {
  data: any;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ data }) => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500">
     <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
            <CheckCircle size={32} className="text-white" strokeWidth={3} />
        </div>
        <h3 className="text-2xl font-black font-display text-white">Tout est bon ?</h3>
        <p className="text-gray-400 font-bold text-sm">Vérifiez les infos avant de lancer.</p>
     </div>

     <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="h-32 bg-white/5 relative border-b border-white/10">
            {data.coverImage && (
                <img src={data.coverImage} className="w-full h-full object-cover" alt="Preview" />
            )}
            <div className="absolute bottom-2 left-2 bg-white/20 backdrop-blur-xl px-2 py-1 rounded-lg border border-white/30 text-xs font-black uppercase text-white">
                {data.category || 'Catégorie'}
            </div>
        </div>
        <div className="p-4">
            <h4 className="font-black text-xl text-white mb-1">{data.title || 'Titre de l\'événement'}</h4>
            <p className="text-sm font-bold text-gray-400 mb-3 flex items-center">
                <Calendar size={14} className="mr-1 text-orange-400" /> {data.date || 'JJ/MM/AAAA'} à {data.time || 'HH:MM'}
            </p>
            <p className="text-sm font-bold text-gray-400 mb-4 flex items-center">
                <MapPin size={14} className="mr-1 text-orange-400" /> {data.location || 'Lieu'}
            </p>
            
            <div className="border-t border-dashed border-white/20 pt-3">
                <p className="text-xs font-black text-gray-500 uppercase mb-2">Billets</p>
                <div className="space-y-1">
                    {data.tickets.map((t: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm font-bold">
                            <span className="text-gray-300">{t.name || 'Standard'}</span>
                            <span className="text-orange-400">{t.price === 0 ? 'Gratuit' : `${t.price} FCFA`}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
     </div>
  </div>
);

export default ReviewStep;
