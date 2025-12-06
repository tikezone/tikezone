'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from '../../../../../lib/safe-navigation';
import OrganizerLayout from '../../../../../components/Layout/OrganizerLayout';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import DetailsForm from '../../../../../components/Publish/DetailsForm';
import TicketsManager from '../../../../../components/Publish/TicketsManager';
import { getEventById, updateEvent } from '../../../../../services/eventService';
import { Event } from '../../../../../types';

export default function EditEventPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'details' | 'tickets'>('details');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Event | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const id = path.split('/').pop();

    if (id) {
      getEventById(id).then((evt) => {
        if (evt) {
          const d = new Date(evt.date);
          const dateStr = d.toLocaleDateString('fr-FR');
          const timeStr = d.toISOString().slice(11, 16);
          const categoryDetails = evt.categoryDetails || {};
          setFormData({
            ...evt,
            ...categoryDetails,
            date: dateStr,
            time: timeStr,
          } as any);
        } else {
          alert("Evenement non trouve");
          router.push('/organizer/events');
        }
        setIsLoading(false);
      });
    }
  }, [router]);

  const handleUpdate = (field: string, value: any) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
      let dateIso = formData.date;
      const fr = (formData.date || '').trim();
      const match = fr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (match) {
        const [_, dd, mm, yyyy] = match;
        const safeTime = (formData as any).time ? `${(formData as any).time}` : '00:00';
        dateIso = new Date(`${yyyy}-${mm}-${dd}T${safeTime}:00`).toISOString();
      } else if ((formData as any).time && formData.date) {
        dateIso = new Date(`${formData.date}T${(formData as any).time}:00`).toISOString();
      }

      const knownFields = ['id', 'title', 'description', 'location', 'date', 'time', 
        'coverImage', 'images', 'imageUrl', 'videoUrl', 'tickets', 'ticketTypes',
        'spot', 'djLineup', 'dressCode', 'waterSecurity', 'category',
        'visibility', 'accessCode', 'slug', 'organizer', 'price', 'status',
        'isPopular', 'isPromo', 'discountPercent', 'isTrending', 'isFeatured',
        'isEventOfYear', 'isVerified', 'availableTickets', 'categoryDetails', 'customSubdomain'];
      const categoryDetails: Record<string, any> = {};
      for (const key of Object.keys(formData)) {
        if (!knownFields.includes(key) && (formData as any)[key]) {
          categoryDetails[key] = (formData as any)[key];
        }
      }

      const payload: any = { ...formData, date: dateIso };
      delete payload.time;
      if (Object.keys(categoryDetails).length > 0) {
        payload.categoryDetails = categoryDetails;
      }
      await updateEvent(payload);
      router.push('/organizer/events');
    } catch (e) {
      console.error('Save failed', e);
      alert('Erreur lors de la sauvegarde.');
      setIsSaving(false);
    }
  };

  if (isLoading || !formData) {
    return (
      <OrganizerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
            <p className="font-bold text-gray-400">Chargement...</p>
          </div>
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout>
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/organizer/events">
              <button className="p-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                <ArrowLeft size={20} className="text-white" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-black uppercase text-white">Modifier l'evenement</h1>
              <p className="text-xs font-bold text-gray-500">Edition de : {formData.title}</p>
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span>{isSaving ? 'Sauvegarde...' : 'Enregistrer'}</span>
          </button>
        </div>

        <div className="flex bg-white/5 backdrop-blur-xl rounded-2xl p-1 border border-white/10">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-6 py-3 font-bold text-sm uppercase rounded-xl transition-all ${
              activeTab === 'details' 
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' 
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Informations
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 px-6 py-3 font-bold text-sm uppercase rounded-xl transition-all ${
              activeTab === 'tickets' 
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' 
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Billetterie
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10">
          {activeTab === 'details' ? (
            <DetailsForm data={formData as any} onChange={handleUpdate} />
          ) : (
            <TicketsManager tickets={formData.ticketTypes || []} onChange={(t) => handleUpdate('ticketTypes', t)} />
          )}
        </div>
      </div>
    </OrganizerLayout>
  );
}
