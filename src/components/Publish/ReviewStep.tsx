import React from 'react';
import { CheckCircle, Calendar, MapPin } from 'lucide-react';

interface ReviewStepProps {
  data: any;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ data }) => (
  <div className="space-y-6 animate-in slide-in-from-right duration-500">
     <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-400 rounded-full border-2 border-black flex items-center justify-center mx-auto mb-4 shadow-pop">
            <CheckCircle size={32} className="text-white" strokeWidth={3} />
        </div>
        <h3 className="text-2xl font-black font-display text-slate-900">Tout est bon ?</h3>
        <p className="text-slate-500 font-bold text-sm">Vérifiez les infos avant de lancer.</p>
     </div>

     <div className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-sm">
        <div className="h-32 bg-slate-200 relative border-b-2 border-black">
            {data.coverImage && (
                <img src={data.coverImage} className="w-full h-full object-cover" alt="Preview" />
            )}
            <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded border border-black text-xs font-black uppercase">
                {data.category || 'Catégorie'}
            </div>
        </div>
        <div className="p-4">
            <h4 className="font-black text-xl text-slate-900 mb-1">{data.title || 'Titre de l\'événement'}</h4>
            <p className="text-sm font-bold text-slate-600 mb-3 flex items-center">
                <Calendar size={14} className="mr-1" /> {data.date || 'JJ/MM/AAAA'} à {data.time || 'HH:MM'}
            </p>
            <p className="text-sm font-bold text-slate-600 mb-4 flex items-center">
                <MapPin size={14} className="mr-1" /> {data.location || 'Lieu'}
            </p>
            
            <div className="border-t-2 border-dashed border-slate-200 pt-3">
                <p className="text-xs font-black text-slate-400 uppercase mb-2">Billets</p>
                <div className="space-y-1">
                    {data.tickets.map((t: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm font-bold">
                            <span>{t.name || 'Standard'}</span>
                            <span>{t.price === 0 ? 'Gratuit' : `${t.price} FCFA`}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
     </div>
  </div>
);

export default ReviewStep;