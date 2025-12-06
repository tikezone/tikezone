'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from '../../lib/safe-navigation';
import MainLayout from '../../components/Layout/MainLayout';
import Button from '../../components/UI/Button';
import TicketsManager from '../../components/Publish/TicketsManager';
import DetailsForm from '../../components/Publish/DetailsForm';
import StepIndicator from '../../components/Publish/StepIndicator';
import CategorySelection from '../../components/Publish/CategorySelection';
import ReviewStep from '../../components/Publish/ReviewStep';
import { useAuth } from '../../context/AuthContext';
import { createEvent } from '../../services/eventService';
import { ArrowRight, ArrowLeft, CheckCircle, Globe, Send, Lock, Info, QrCode, Copy, LayoutGrid } from 'lucide-react';
import { TicketTier, Event } from '../../types';

type Step = 1 | 2 | 3 | 4 | 5;

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
  organizationName?: string;
  slug?: string;
}

const INITIAL_DATA: EventFormData = {
  category: '',
  title: '',
  description: '',
  location: '',
  date: '',
  time: '',
  coverImage: null,
  images: [],
  tickets: [],
  lineup: '',
  prerequisites: '',
  dresscode: '',
  spot: '',
  djLineup: '',
  dressCode: '',
  waterSecurity: '',
  organizationName: '',
  slug: '',
};

const SuccessStep = ({ data, onGoDashboard }: { data: EventFormData; onGoDashboard: () => void }) => {
  const shareLink = data.slug ? `https://${data.slug}.tikezone.com` : `https://tikezone.com/e/${Math.random().toString(36).substr(2, 6)}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-700 text-center py-8">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-500 rounded-full border border-white/20 flex items-center justify-center shadow-lg shadow-green-500/30 animate-bounce">
            <CheckCircle size={48} className="text-white" strokeWidth={3} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-4xl font-black text-white font-display uppercase mb-2">Félicitations !</h2>
        <p className="text-lg font-bold text-gray-400">
          Votre évènement <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 border border-orange-500/30 rounded-lg">{data.title}</span> est en ligne.
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-2xl border border-white/20 max-w-sm mx-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-white/10 backdrop-blur-xl p-3 rounded-xl border border-white/20 mb-3">
            <QrCode size={100} className="text-white" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">Scan Me</span>
        </div>

        <div className="space-y-2 text-left">
          <label className="text-xs font-black text-white uppercase ml-1">Lien public à partager</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm font-bold text-gray-300 truncate select-all">
              {shareLink}
            </div>
            <button
              onClick={handleCopy}
              className={`px-4 rounded-xl border font-black transition-all flex items-center justify-center ${
                copied ? 'bg-green-500 text-white border-green-500' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={onGoDashboard} variant="primary" className="px-8 py-4 text-lg" icon={<LayoutGrid size={20} />}>
          Aller au Tableau de bord
        </Button>
      </div>
    </div>
  );
};

export default function PublishPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<EventFormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  useEffect(() => {
    if (isAuthenticated && !formData.organizationName) {
      fetch('/api/organizer/settings/profile')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.user?.companyName) {
            setFormData(prev => ({ ...prev, organizationName: data.user.companyName }));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleUpdate = (field: string, value: any) => {
    if (stepError) setStepError(null);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step === 1 && !formData.category) {
      setStepError('Choisis une catégorie pour continuer.');
      return;
    }
    if (step === 2 && (!formData.organizationName || !formData.title || !formData.date || !formData.location)) {
      setStepError('Nom de l\'organisation, titre, date et lieu sont obligatoires.');
      return;
    }
    if (step === 3 && formData.tickets.length === 0) {
      setStepError('Ajoute au moins un type de billet.');
      return;
    }
    setStepError(null);
    if (step < 4) setStep(prev => (prev + 1) as Step);
  };

  const prevStep = () => {
    if (step > 1) setStep(prev => (prev - 1) as Step);
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setStepError(null);

    // Collect all dynamic category-specific fields into categoryDetails
    const knownFields = ['category', 'title', 'description', 'location', 'date', 'time', 
      'coverImage', 'images', 'tickets', 'spot', 'djLineup', 'dressCode', 'waterSecurity',
      'visibility', 'accessCode', 'companyName', 'organizationName', 'slug'];
    const categoryDetails: Record<string, any> = {};
    for (const key of Object.keys(formData)) {
      if (!knownFields.includes(key) && (formData as any)[key]) {
        categoryDetails[key] = (formData as any)[key];
      }
    }

    const newEvent: Event = {
      ...formData,
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `evt_${Math.random().toString(36).substr(2, 9)}`,
      organizer: formData.organizationName || 'TIKEZONE',
      price: formData.tickets[0]?.price || 0,
      imageUrl: formData.coverImage || 'https://picsum.photos/800/600',
      images: formData.images,
      status: 'published' as const,
      ticketTypes: formData.tickets,
      availableTickets: formData.tickets.reduce((acc, t) => acc + t.quantity, 0),
      isTrending: true,
      category: formData.category as any,
      spot: formData.spot,
      djLineup: formData.djLineup,
      dressCode: formData.dressCode,
      waterSecurity: formData.waterSecurity,
      categoryDetails: Object.keys(categoryDetails).length > 0 ? categoryDetails : undefined,
    };

    try {
      await createEvent(newEvent);
      setStep(5);
    } catch (e) {
      console.error('Failed to publish', e);
      setSubmitError('Impossible de publier pour le moment. Ressaie ou contacte le support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout showAnnouncement={false}>
      {!isAuthenticated ? (
        <div className="flex-grow flex items-center justify-center p-4 min-h-[80vh] bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 overflow-hidden text-center relative">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 border-b border-white/20">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 flex items-center justify-center mx-auto mb-4">
                <Lock size={32} className="text-white" strokeWidth={3} />
              </div>
              <h2 className="text-3xl font-black text-white font-display uppercase tracking-wide">Espace privé</h2>
            </div>
            <div className="p-8">
              <p className="text-gray-400 font-bold mb-8 leading-relaxed">
                Pour organiser des évènements magiques, vous devez d&apos;abord vous identifier.
              </p>
              <div className="space-y-4">
                <Link href="/login?redirect=/publish" className="block">
                  <Button fullWidth variant="primary" icon={<ArrowRight size={18} />}>
                    Me connecter
                  </Button>
                </Link>
                <Link href="/register?redirect=/publish" className="block">
                  <button className="w-full py-3 bg-white/10 backdrop-blur-xl text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                    Créer un compte
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-[calc(100vh-80px)] bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black flex items-center justify-center p-4 sm:p-8 font-sans">
          <div className="relative w-full max-w-5xl perspective-1000">
            <div className="absolute top-4 left-4 right-0 bottom-0 bg-white/5 rounded-[2.5rem] -z-10 hidden md:block" />

            <div className="bg-white/10 backdrop-blur-2xl rounded-[2rem] border border-white/20 flex flex-col md:flex-row overflow-hidden relative min-h-[650px] shadow-2xl">
              <div
                className={`w-full md:w-5/12 border-b md:border-b-0 md:border-r border-white/20 p-8 md:p-10 flex flex-col justify-between relative overflow-hidden transition-colors duration-500 ${
                  step === 1 ? 'bg-gradient-to-br from-orange-500/30 to-orange-600/10' : step === 2 ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/10' : step === 3 ? 'bg-gradient-to-br from-pink-500/30 to-pink-600/10' : step === 4 ? 'bg-gradient-to-br from-green-500/30 to-green-600/10' : 'bg-gradient-to-br from-purple-500/30 to-purple-600/10'
                }`}
              >
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                <div className="relative z-10">
                  {step < 5 && (
                    <Link
                      href="/organizer"
                      className="inline-flex items-center text-xs font-black uppercase tracking-wider bg-white/10 backdrop-blur-xl text-white px-3 py-1.5 rounded-lg border border-white/20 mb-8 hover:bg-white/20 transition-colors"
                    >
                      <ArrowLeft size={14} className="mr-1" /> Annuler
                    </Link>
                  )}

                  <h1 className="text-4xl md:text-5xl font-black font-display leading-tight mb-4 drop-shadow-sm uppercase text-white">
                    {step === 5 ? "C'est en ligne !" : "Créer \n l'évènement"}
                  </h1>
                  <p className="text-lg font-bold leading-snug opacity-90 max-w-xs text-gray-300">
                    {step === 1 && "Tout commence par une idée. De quoi s'agit-il ?"}
                    {step === 2 && 'Dites-nous où et quand la magie va opérer.'}
                    {step === 3 && "Définissez vos offres. Gratuit ou VIP, c'est vous le chef."}
                    {step === 4 && 'Prêt au décollage ? Vérifiez une dernière fois.'}
                    {step === 5 && 'Le monde est prêt à découvrir votre création.'}
                  </p>
                </div>

                <div className="flex-grow flex items-center justify-center relative z-10 py-8">
                  <div className={`p-6 rounded-full border border-white/20 shadow-lg animate-bounce-slow ${step === 5 ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/30' : 'bg-white/10 backdrop-blur-xl text-white'}`}>
                    {step === 1 && <SparklesIcon size={64} />}
                    {step === 2 && <CalendarIcon size={64} />}
                    {step === 3 && <TicketIcon size={64} />}
                    {step === 4 && <RocketIcon size={64} />}
                    {step === 5 && <Globe size={64} strokeWidth={2.5} />}
                  </div>
                </div>

                {step < 5 && (
                  <div className="bg-white/10 backdrop-blur-xl p-4 rounded-xl border border-white/20 relative z-10">
                    <div className="flex items-start">
                      <Info size={20} className="text-orange-400 mr-2 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="text-[10px] font-black uppercase text-orange-400 mb-1">Conseil de pro</p>
                        <p className="text-xs font-bold text-gray-300 leading-relaxed">
                          {step === 1 && 'Les concerts et festivals ont 3x plus de visibilité le week-end.'}
                          {step === 2 && "Ajoutez une image de haute qualité pour attirer l'œil."}
                          {step === 3 && "Proposez plusieurs niveaux de prix pour maximiser vos ventes."}
                          {step === 4 && "Relisez bien avant de publier, votre événement sera visible par tous."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden md:flex flex-col justify-evenly absolute left-[41.66%] top-6 bottom-6 w-6 -ml-3 z-30 pointer-events-none">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                  <div key={i} className="w-10 h-4 bg-white/20 border border-white/10 rounded-full transform -rotate-6"></div>
                ))}
              </div>

              <div className="w-full md:w-7/12 bg-white/5 backdrop-blur-xl p-6 md:p-10 flex flex-col relative">
                {step < 5 && <div className="absolute top-6 right-8 text-white/10 font-black text-4xl font-display">0{step}</div>}

                {step < 5 && <StepIndicator currentStep={step} />}

                <div className="flex-grow relative">
                  {stepError && (
                    <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 p-3 font-bold text-sm" role="alert">
                      {stepError}
                    </div>
                  )}

                  {step === 1 && <CategorySelection selected={formData.category} onSelect={id => handleUpdate('category', id)} />}
                  {step === 2 && <DetailsForm data={formData} onChange={handleUpdate} />}
                  {step === 3 && <TicketsManager tickets={formData.tickets} onChange={t => handleUpdate('tickets', t)} />}
                  {step === 4 && <ReviewStep data={formData} />}
                  {step === 5 && <SuccessStep data={formData} onGoDashboard={() => router.push('/organizer/events')} />}
                </div>

                {step < 5 && (
                  <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                    <button
                      onClick={prevStep}
                      disabled={step === 1}
                      className={`flex items-center text-sm font-bold uppercase transition-colors ${step === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:text-orange-400'}`}
                    >
                      <ArrowLeft size={18} className="mr-2" strokeWidth={3} /> Précédent
                    </button>

                    {step < 4 ? (
                      <Button onClick={nextStep} variant="primary" className="px-8 shadow-lg shadow-orange-500/30" icon={<ArrowRight size={18} />}>
                        Suivant
                      </Button>
                    ) : (
                      <button
                        onClick={handlePublish}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/30 hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                        Publier
                      </button>
                    )}
                  </div>
                )}

                {submitError && (
                  <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 p-3 font-bold text-sm" role="alert">
                    {submitError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

const SparklesIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M9 3v4" />
    <path d="M3 5h4" />
    <path d="M3 9h4" />
  </svg>
);

const CalendarIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </svg>
);

const TicketIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
);

const RocketIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);
