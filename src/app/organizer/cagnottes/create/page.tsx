'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from '../../../../lib/safe-navigation';
import OrganizerLayout from '../../../../components/Layout/OrganizerLayout';
import { ArrowLeft, Save, Loader2, Coins, Calendar, Target, FileText, Image as ImageIcon } from 'lucide-react';

interface CagnotteFormData {
  title: string;
  description: string;
  reason: string;
  goal_amount: string;
  min_contribution: string;
  suggested_contribution: string;
  start_date: string;
  end_date: string;
  rules: string;
  image_url: string;
}

export default function CreateCagnottePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CagnotteFormData>({
    title: '',
    description: '',
    reason: '',
    goal_amount: '',
    min_contribution: '500',
    suggested_contribution: '5000',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    rules: '',
    image_url: '',
  });

  const handleChange = (field: keyof CagnotteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (!formData.reason.trim()) newErrors.reason = 'La raison est requise';
    if (!formData.goal_amount || parseInt(formData.goal_amount) < 1000) {
      newErrors.goal_amount = 'L\'objectif doit etre d\'au moins 1000 F';
    }
    if (!formData.end_date) newErrors.end_date = 'La date de fin est requise';
    if (formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'La date de fin doit etre apres la date de debut';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/cagnottes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          reason: formData.reason.trim(),
          goal_amount: parseInt(formData.goal_amount),
          min_contribution: parseInt(formData.min_contribution) || 500,
          suggested_contribution: parseInt(formData.suggested_contribution) || 5000,
          start_date: formData.start_date,
          end_date: formData.end_date,
          rules: formData.rules.trim(),
          image_url: formData.image_url.trim(),
        }),
      });

      if (res.ok) {
        router.push('/organizer/cagnottes');
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la creation');
        setIsSaving(false);
      }
    } catch (e) {
      console.error('Error creating cagnotte:', e);
      alert('Erreur lors de la creation');
      setIsSaving(false);
    }
  };

  const formatPrice = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  return (
    <OrganizerLayout>
      <div className="max-w-3xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/organizer/cagnottes">
              <button className="p-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                <ArrowLeft size={20} className="text-white" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-black uppercase text-white flex items-center gap-3">
                <Coins className="text-yellow-400" size={28} />
                Nouvelle Cagnotte
              </h1>
              <p className="text-xs font-bold text-gray-500">Creez une collecte de fonds</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-6">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <FileText size={20} className="text-yellow-400" />
              Informations generales
            </h2>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Titre de la cagnotte *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ex: Aide pour les frais medicaux de Jean"
                className={`w-full bg-white/5 border ${errors.title ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors`}
              />
              {errors.title && <p className="text-red-400 text-xs font-bold mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Decrivez votre cagnotte en detail..."
                rows={4}
                className={`w-full bg-white/5 border ${errors.description ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors resize-none`}
              />
              {errors.description && <p className="text-red-400 text-xs font-bold mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Raison de la collecte *</label>
              <select
                value={formData.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                className={`w-full bg-white/5 border ${errors.reason ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors`}
              >
                <option value="" className="bg-slate-900">Selectionnez une raison</option>
                <option value="medical" className="bg-slate-900">Frais medicaux</option>
                <option value="education" className="bg-slate-900">Education / Scolarite</option>
                <option value="funeral" className="bg-slate-900">Frais funeraires</option>
                <option value="emergency" className="bg-slate-900">Urgence / Sinistre</option>
                <option value="project" className="bg-slate-900">Projet personnel</option>
                <option value="community" className="bg-slate-900">Projet communautaire</option>
                <option value="celebration" className="bg-slate-900">Celebration / Evenement</option>
                <option value="other" className="bg-slate-900">Autre</option>
              </select>
              {errors.reason && <p className="text-red-400 text-xs font-bold mt-1">{errors.reason}</p>}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-6">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Target size={20} className="text-yellow-400" />
              Objectif financier
            </h2>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Objectif a atteindre (F CFA) *</label>
              <div className="relative">
                <input
                  type="text"
                  value={formatPrice(formData.goal_amount)}
                  onChange={(e) => handleChange('goal_amount', e.target.value.replace(/\D/g, ''))}
                  placeholder="1 000 000"
                  className={`w-full bg-white/5 border ${errors.goal_amount ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 pr-16 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">F CFA</span>
              </div>
              {errors.goal_amount && <p className="text-red-400 text-xs font-bold mt-1">{errors.goal_amount}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Contribution minimum</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatPrice(formData.min_contribution)}
                    onChange={(e) => handleChange('min_contribution', e.target.value.replace(/\D/g, ''))}
                    placeholder="500"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-16 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">F</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Contribution suggeree</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatPrice(formData.suggested_contribution)}
                    onChange={(e) => handleChange('suggested_contribution', e.target.value.replace(/\D/g, ''))}
                    placeholder="5 000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-16 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">F</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-6">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Calendar size={20} className="text-yellow-400" />
              Dates
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Date de debut</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Date de fin *</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  min={formData.start_date}
                  className={`w-full bg-white/5 border ${errors.end_date ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors`}
                />
                {errors.end_date && <p className="text-red-400 text-xs font-bold mt-1">{errors.end_date}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-6">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <ImageIcon size={20} className="text-yellow-400" />
              Media et regles
            </h2>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Image de couverture (URL)</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://exemple.com/image.jpg"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Regles de la cagnotte (optionnel)</label>
              <textarea
                value={formData.rules}
                onChange={(e) => handleChange('rules', e.target.value)}
                placeholder="Conditions de participation, regles de redistribution..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-4">
            <p className="text-sm text-yellow-200 font-bold">
              <span className="text-yellow-400">Note:</span> Votre cagnotte sera soumise a validation avant d'etre mise en ligne. Vous recevrez une notification une fois approuvee.
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/organizer/cagnottes" className="flex-1">
              <button
                type="button"
                className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-black text-gray-300 hover:bg-white/10 transition-all"
              >
                Annuler
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-black text-white hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creation...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Creer la cagnotte
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </OrganizerLayout>
  );
}
