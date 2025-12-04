'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from '../../../../../lib/safe-navigation';
import OrganizerLayout from '../../../../../components/Layout/OrganizerLayout';
import Button from '../../../../../components/UI/Button';
import { ArrowLeft, Save, Eye } from 'lucide-react';
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
          const dateStr = d.toLocaleDateString('fr-FR'); // jj/mm/aaaa
          const timeStr = d.toISOString().slice(11, 16);
          setFormData({
            ...evt,
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
      const payload: any = { ...formData, date: dateIso };
      delete payload.time; // backend ne connaît pas ce champ
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
          <p className="font-bold text-slate-500">Chargement...</p>
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
              <button className="p-2 bg-white border-2 border-black rounded-full hover:bg-slate-100 transition-colors shadow-sm">
                <ArrowLeft size={20} />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-black uppercase text-slate-900">Modifier l'evenement</h1>
              <p className="text-xs font-bold text-slate-500">Edition de : {formData.title}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {formData?.id && (
              <Link href={formData.slug ? `/events/${formData.slug}` : `/events/${formData.id}`} target="_blank">
                <Button variant="ghost" className="hidden sm:flex" icon={<Eye size={18} />}>
                  Apercu
                </Button>
              </Link>
            )}
            <Button variant="primary" onClick={handleSave} isLoading={isSaving} icon={<Save size={18} />}>
              Enregistrer
            </Button>
          </div>
        </div>

        <div className="flex border-b-2 border-slate-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-black text-sm uppercase border-b-4 transition-colors ${
              activeTab === 'details' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Informations
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-6 py-3 font-black text-sm uppercase border-b-4 transition-colors ${
              activeTab === 'tickets' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Billetterie
          </button>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-black shadow-pop">
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
