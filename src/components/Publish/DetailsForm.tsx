
'use client';

import React, { useRef } from 'react';
import Input from '../UI/Input';
import { MapPin, Camera, CheckCircle, Music, Info, Globe, Plus, X, Star, AlertCircle, Check } from 'lucide-react';
import PrivacySettings from './PrivacySettings';
import EventTypeFields from './EventTypeFields';

interface TicketTier {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
}

interface EventFormData {
  category: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  coverImage: string | null;
  images: string[];
  tickets: TicketTier[];
  lineup?: string; 
  prerequisites?: string; 
  dresscode?: string;
  spot?: string;
  djLineup?: string;
  dressCode?: string;
  waterSecurity?: string;
  visibility?: 'public' | 'private';
  accessCode?: string;
  companyName?: string;
  slug?: string;
  [key: string]: any;
}

interface DetailsFormProps {
  data: EventFormData;
  onChange: (field: string, value: any) => void;
}

const DetailsForm: React.FC<DetailsFormProps> = ({ data, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      
      const updatedImages = [...(data.images || []), ...newUrls];
      
      onChange('images', updatedImages);
      
      if (!data.coverImage && updatedImages.length > 0) {
        onChange('coverImage', updatedImages[0]);
      }
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...data.images];
    const removedUrl = updatedImages[index];
    updatedImages.splice(index, 1);
    
    onChange('images', updatedImages);
    
    if (data.coverImage === removedUrl) {
        onChange('coverImage', updatedImages.length > 0 ? updatedImages[0] : null);
    }
  };

  const setAsCover = (url: string) => {
    onChange('coverImage', url);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toLowerCase();
    val = val.replace(/\s+/g, '-');
    val = val.replace(/[^a-z0-9-]/g, '');
    val = val.replace(/-+/g, '-');
    if (val.startsWith('-')) val = val.substring(1);
    onChange('slug', val);
  };

  const isSlugValid = data.slug && data.slug.length >= 3 && !data.slug.endsWith('-');
  const isSlugEmpty = !data.slug || data.slug.length === 0;

  const formatFrDateInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let out = '';
    if (digits.length >= 2) out = digits.slice(0, 2);
    else out = digits;
    if (digits.length > 2) out += '/' + digits.slice(2, 4);
    if (digits.length > 4) out += '/' + digits.slice(4);
    return out;
  };

  const handleDateChange = (val: string) => {
    const formatted = formatFrDateInput(val);
    onChange('date', formatted);
  };

  const datePreview = (() => {
    const fr = (data.date || '').trim();
    const match = fr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    let dt: Date | null = null;
    if (match) {
      const [_, dd, mm, yyyy] = match;
      const time = data.time ? `${data.time}` : '00:00';
      dt = new Date(`${yyyy}-${mm}-${dd}T${time}:00`);
    } else if (fr) {
      dt = new Date(fr);
    }
    if (dt && !Number.isNaN(dt.getTime())) {
      const datePart = dt.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      const timePart = data.time
        ? dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : '';
      return `${datePart}${timePart ? ` à ${timePart}` : ''}`;
    }
    return null;
  })();

  return (
    <div className="space-y-5 animate-in slide-in-from-right duration-500">
      <div className="text-center mb-2">
        <h3 className="text-2xl font-black font-display text-white">Les Détails</h3>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-black text-white uppercase ml-1 block">Galerie Photos</label>
        
        <div className="grid grid-cols-3 gap-3">
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 hover:border-white/50 transition-all cursor-pointer group backdrop-blur-xl"
            >
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Plus size={20} className="text-gray-400 group-hover:text-white" strokeWidth={3} />
                </div>
                <p className="text-[10px] font-bold text-gray-500 group-hover:text-white text-center px-2">Ajouter photos</p>
                <input 
                    type="file" 
                    multiple
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                />
            </div>

            {data.images && data.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl border border-white/20 overflow-hidden group hover:border-white/40 transition-all">
                    <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={12} strokeWidth={3} />
                    </button>

                    {data.coverImage === img ? (
                        <div className="absolute bottom-1 left-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded border border-white/20 flex items-center">
                            <Star size={8} className="mr-1 fill-white" /> COUV.
                        </div>
                    ) : (
                        <button 
                            onClick={() => setAsCover(img)}
                            className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold py-1 opacity-0 group-hover:opacity-100 transition-opacity text-center hover:bg-black/90"
                        >
                            Définir couverture
                        </button>
                    )}
                </div>
            ))}
        </div>
      </div>

      <Input 
        label="Titre de l'événement" 
        placeholder="Ex: Festival des Grillades 2025" 
        value={data.title}
        onChange={(e) => onChange('title', e.target.value)}
        required
      />

      <div className="space-y-2">
        <div className="flex justify-between items-center ml-1">
            <label className="text-xs font-black text-white uppercase">Lien personnalisé</label>
            {!isSlugEmpty && (
                <span className={`text-[10px] font-bold flex items-center ${isSlugValid ? 'text-green-400' : 'text-red-400'}`}>
                    {isSlugValid ? (
                        <><Check size={12} className="mr-1" /> Disponible</>
                    ) : (
                        <><AlertCircle size={12} className="mr-1" /> Trop court</>
                    )}
                </span>
            )}
        </div>
        
        <div className={`
            flex items-center rounded-xl border transition-all overflow-hidden backdrop-blur-xl
            ${isSlugValid 
                ? 'border-green-500/50 shadow-[0_0_0_2px_rgba(34,197,94,0.1)]' 
                : 'border-white/20'}
        `}>
            <div className="bg-white/10 border-r border-white/20 px-3 py-3 text-xs font-bold text-gray-400 flex items-center whitespace-nowrap h-full">
                <Globe size={14} className="mr-1" /> https://
            </div>
            <input 
                className="flex-1 py-3 px-2 text-white placeholder-gray-500 focus:outline-none font-black text-sm text-right bg-transparent"
                placeholder="mon-evenement"
                value={data.slug || ''}
                onChange={handleSlugChange}
            />
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 border-l border-white/20 px-3 py-3 text-xs font-black text-white flex items-center whitespace-nowrap h-full">
                .tikezone.com
            </div>
        </div>
        <p className="text-[10px] font-bold text-gray-500 ml-1 flex justify-between">
            <span>Caractères autorisés : a-z, 0-9 et tiret (-)</span>
            {data.slug && <span className="text-gray-400">{data.slug.length} chars</span>}
        </p>
      </div>

      <div className="space-y-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-white/20 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-white uppercase flex items-center gap-2">
            <Star size={14} className="text-orange-400 fill-orange-400" />
            Sous-domaine personnalisé
          </label>
          <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">PRO</span>
        </div>
        
        <div className="flex items-center rounded-xl border border-white/20 overflow-hidden bg-white/5">
          <input 
            className="flex-1 py-3 px-3 text-white placeholder-gray-500 focus:outline-none font-black text-sm bg-transparent"
            placeholder="monsuper-event"
            value={data.customSubdomain || ''}
            onChange={(e) => {
              let val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 63);
              if (val.startsWith('-')) val = val.substring(1);
              onChange('customSubdomain', val || undefined);
            }}
          />
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 border-l border-white/20 px-3 py-3 text-xs font-black text-white flex items-center whitespace-nowrap">
            .tikezone.com
          </div>
        </div>
        <p className="text-[10px] font-bold text-gray-400">
          Exemple : <span className="text-purple-300">lepetitpoto</span>.tikezone.com redirigera vers ton événement
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <Input 
              label="Date" 
              type="text"
              placeholder="jj/mm/aaaa"
              value={data.date}
              onChange={(e) => handleDateChange(e.target.value)}
              required
          />
          <Input 
              label="Heure" 
              type="time"
              value={data.time}
              onChange={(e) => onChange('time', e.target.value)}
              required
          />
      </div>
      {datePreview && (
        <p className="text-xs font-bold text-gray-400 ml-1">
          Aperçu : {datePreview}
        </p>
      )}

      <Input 
        label="Lieu" 
        placeholder="Ex: Palais de la Culture" 
        icon={<MapPin size={18} />}
        value={data.location}
        onChange={(e) => onChange('location', e.target.value)}
        required
      />

      <div className="space-y-2">
          <label className="text-xs font-black text-white uppercase ml-1 block">Description</label>
          <textarea 
              rows={3}
              className="w-full p-4 rounded-xl border border-white/20 font-bold text-sm bg-white/5 backdrop-blur-xl focus:border-white/40 outline-none resize-none placeholder-gray-500 text-white"
              placeholder="Racontez-nous tout..."
              value={data.description}
              onChange={(e) => onChange('description', e.target.value)}
          />
      </div>

      <EventTypeFields 
        eventType={data.category} 
        onChange={onChange} 
        data={data}
      />

      <PrivacySettings 
        visibility={data.visibility || 'public'}
        accessCode={data.accessCode || ''}
        onVisibilityChange={(v) => onChange('visibility', v)}
        onAccessCodeChange={(c) => onChange('accessCode', c)}
      />
    </div>
  );
};

export default DetailsForm;
