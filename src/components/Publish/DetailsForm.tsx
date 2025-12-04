
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
  // Dynamic fields
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

  // --- SLUG VALIDATION LOGIC ---
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toLowerCase();
    
    // 1. Replace spaces with hyphens
    val = val.replace(/\s+/g, '-');
    
    // 2. Remove invalid characters (keep only a-z, 0-9, and -)
    val = val.replace(/[^a-z0-9-]/g, '');
    
    // 3. Prevent multiple consecutive hyphens
    val = val.replace(/-+/g, '-');

    // 4. Prevent hyphen at the start
    if (val.startsWith('-')) val = val.substring(1);

    onChange('slug', val);
  };

  // Check if slug is valid (min 3 chars, doesn't end with hyphen)
  const isSlugValid = data.slug && data.slug.length >= 3 && !data.slug.endsWith('-');
  const isSlugEmpty = !data.slug || data.slug.length === 0;

  const formatFrDateInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8); // jjmmaaaa
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
        <h3 className="text-2xl font-black font-display text-slate-900">Les Détails</h3>
      </div>

      {/* MULTI-IMAGE UPLOADER */}
      <div className="space-y-3">
        <label className="text-xs font-black text-slate-900 uppercase ml-1 block">Galerie Photos</label>
        
        <div className="grid grid-cols-3 gap-3">
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-black transition-all cursor-pointer group"
            >
                <div className="w-10 h-10 bg-white rounded-full border-2 border-slate-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform group-hover:border-black shadow-sm">
                    <Plus size={20} className="text-slate-400 group-hover:text-black" strokeWidth={3} />
                </div>
                <p className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900 text-center px-2">Ajouter photos</p>
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
                <div key={idx} className="relative aspect-square rounded-2xl border-2 border-black overflow-hidden group shadow-sm hover:shadow-pop-sm transition-all">
                    <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg border border-black opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={12} strokeWidth={3} />
                    </button>

                    {data.coverImage === img ? (
                        <div className="absolute bottom-1 left-1 bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded border border-black flex items-center">
                            <Star size={8} className="mr-1 fill-black" /> COUV.
                        </div>
                    ) : (
                        <button 
                            onClick={() => setAsCover(img)}
                            className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] font-bold py-1 opacity-0 group-hover:opacity-100 transition-opacity text-center hover:bg-black"
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

      {/* --- SLUG INPUT WITH VALIDATION --- */}
      <div className="space-y-2">
        <div className="flex justify-between items-center ml-1">
            <label className="text-xs font-black text-slate-900 uppercase">Lien personnalisé</label>
            {!isSlugEmpty && (
                <span className={`text-[10px] font-bold flex items-center ${isSlugValid ? 'text-green-600' : 'text-red-500'}`}>
                    {isSlugValid ? (
                        <><Check size={12} className="mr-1" /> Disponible</>
                    ) : (
                        <><AlertCircle size={12} className="mr-1" /> Trop court</>
                    )}
                </span>
            )}
        </div>
        
        <div className={`
            flex items-center rounded-xl border-2 transition-all overflow-hidden
            ${isSlugValid 
                ? 'border-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.1)]' 
                : (isSlugEmpty ? 'border-black' : 'border-black')
            }
        `}>
            <div className="bg-slate-100 border-r-2 border-black px-3 py-3 text-xs font-bold text-slate-500 flex items-center whitespace-nowrap h-full">
                <Globe size={14} className="mr-1" /> https://
            </div>
            <input 
                className="flex-1 py-3 px-2 text-slate-900 placeholder-slate-300 focus:outline-none focus:bg-yellow-50 font-black text-sm text-right bg-white"
                placeholder="mon-evenement"
                value={data.slug || ''}
                onChange={handleSlugChange}
            />
            <div className="bg-slate-900 border-l-2 border-black px-3 py-3 text-xs font-black text-white flex items-center whitespace-nowrap shadow-sm h-full">
                .tikezone.com
            </div>
        </div>
        <p className="text-[10px] font-bold text-slate-400 ml-1 flex justify-between">
            <span>Caractères autorisés : a-z, 0-9 et tiret (-)</span>
            {data.slug && <span className="text-slate-500">{data.slug.length} chars</span>}
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
        <p className="text-xs font-bold text-slate-500 ml-1">
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
          <label className="text-xs font-black text-slate-900 uppercase ml-1 block">Description</label>
          <textarea 
              rows={3}
              className="w-full p-4 rounded-xl border-2 border-black font-bold text-sm bg-white focus:shadow-pop-sm outline-none resize-none placeholder-slate-400"
              placeholder="Racontez-nous tout..."
              value={data.description}
              onChange={(e) => onChange('description', e.target.value)}
          />
      </div>

      {/* DYNAMIC FIELDS BASED ON EVENT TYPE */}
      <EventTypeFields 
        eventType={data.category} 
        onChange={onChange} 
        data={data}
      />

      {/* Privacy Settings Module */}
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
