'use client';

import React, { useEffect, useState } from 'react';
import OrganizerLayout from '../../../components/Layout/OrganizerLayout';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import { Save, User, Building, CreditCard, Bell, Shield, Smartphone, Globe, Phone } from 'lucide-react';

type Tab = 'profile' | 'payment' | 'security';

export default function OrganizerSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    companyName: '',
    bio: '',
    website: '',
    phone: '',
    avatarUrl: '',
    facebook: '',
    instagram: '',
    tiktok: '',
  });

  const [payouts, setPayouts] = useState({
    wave: '',
    om: '',
    mtn: '',
    bankName: '',
    iban: '',
  });

  const [notifications, setNotifications] = useState({
    saleAlert: true,
    loginAlert: true,
  });

  const countries = [
    { code: 'CI', label: "Cote d'Ivoire", dial: '+225', flag: '🇨🇮' },
    { code: 'SN', label: 'Senegal', dial: '+221', flag: '🇸🇳' },
    { code: 'ML', label: 'Mali', dial: '+223', flag: '🇲🇱' },
    { code: 'BF', label: 'Burkina Faso', dial: '+226', flag: '🇧🇫' },
    { code: 'BJ', label: 'Benin', dial: '+229', flag: '🇧🇯' },
  ];
  const [phoneCountry, setPhoneCountry] = useState(countries[0]);

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [secError, setSecError] = useState<string | null>(null);
  const [secLoading, setSecLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [profRes, payRes, notifRes] = await Promise.all([
          fetch('/api/organizer/settings/profile', { cache: 'no-store' }),
          fetch('/api/organizer/settings/payments', { cache: 'no-store' }),
          fetch('/api/organizer/settings/notifications', { cache: 'no-store' }),
        ]);
        const profData = await profRes.json().catch(() => ({}));
        if (profRes.ok && profData.user) {
          setProfile({
            name: profData.user.name || '',
            email: profData.user.email || '',
            companyName: profData.user.companyName || '',
            bio: profData.user.bio || '',
            website: profData.user.website || '',
            phone: profData.user.phone || '',
            avatarUrl: profData.user.avatarUrl || '',
            facebook: profData.user.facebook || '',
            instagram: profData.user.instagram || '',
            tiktok: profData.user.tiktok || '',
          });
        }
        const payData = await payRes.json().catch(() => ({}));
        if (payRes.ok && payData.payouts) {
          setPayouts({
            wave: payData.payouts.wave || '',
            om: payData.payouts.om || '',
            mtn: payData.payouts.mtn || '',
            bankName: payData.payouts.bankName || '',
            iban: payData.payouts.iban || '',
          });
        }
        const notifData = await notifRes.json().catch(() => ({}));
        if (notifRes.ok && notifData.notifications) {
          setNotifications({
            saleAlert: !!notifData.notifications.saleAlert,
            loginAlert: !!notifData.notifications.loginAlert,
          });
        }
      } catch {
        // ignore soft
      }
    };
    load();
  }, []);

  const saveAll = async () => {
    setIsLoading(true);
    setToast(null);
    try {
      const [profRes, payRes, notifRes] = await Promise.all([
        fetch('/api/organizer/settings/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        }),
        fetch('/api/organizer/settings/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payouts),
        }),
        fetch('/api/organizer/settings/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notifications),
        }),
      ]);
      if (!profRes.ok || !payRes.ok || !notifRes.ok) throw new Error('Sauvegarde impossible');
      setToast('Parametres mis a jour');
    } catch (err: any) {
      setToast(err?.message || 'Sauvegarde impossible');
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.next !== passwords.confirm) {
      setSecError('Les mots de passe ne correspondent pas');
      return;
    }
    setSecLoading(true);
    setSecError(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: passwords.current, newPassword: passwords.next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Echec mise a jour');
      setPasswords({ current: '', next: '', confirm: '' });
      setToast('Mot de passe mis a jour');
    } catch (err: any) {
      setSecError(err?.message || 'Echec mise a jour');
    } finally {
      setSecLoading(false);
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <OrganizerLayout>
      <div className="space-y-8 max-w-4xl mx-auto pb-20">
        <h1 className="text-3xl font-black text-slate-900 font-display uppercase">Parametres</h1>

        {toast && <div className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold">{toast}</div>}

        <div className="flex flex-wrap gap-2 border-b-2 border-slate-200 pb-1">
          <TabButton label="Profil Organisation" icon={<Building size={16} />} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <TabButton label="Paiements & Retraits" icon={<CreditCard size={16} />} active={activeTab === 'payment'} onClick={() => setActiveTab('payment')} />
          <TabButton label="Securite" icon={<Shield size={16} />} active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-black shadow-pop">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 bg-slate-100 rounded-full border-2 border-black flex items-center justify-center overflow-hidden relative">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-slate-400" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        setToast('Fichier trop volumineux (5MB max)');
                        return;
                      }
                      const form = new FormData();
                      form.append('file', file);
                      const res = await fetch('/api/organizer/settings/profile/avatar', { method: 'POST', body: form });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok || !data.url) {
                        setToast(data.error || 'Upload impossible');
                        return;
                      }
                      setProfile((p) => ({ ...p, avatarUrl: data.url }));
                      setToast('Avatar mis a jour');
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-black text-lg">Logo / Avatar</h3>
                  <p className="text-sm text-slate-500 font-medium">Recommande : 400x400px</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nom de l'organisation" placeholder="Ex: Universal Music" value={profile.companyName} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} icon={<Building size={16} />} />
                <Input label="Email de contact" placeholder="contact@orga.com" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} icon={<User size={16} />} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase ml-1">Bio / Description</label>
                <textarea className="w-full p-3 rounded-xl border-2 border-black font-bold text-sm resize-none focus:shadow-pop-sm outline-none bg-slate-50" rows={3} placeholder="Dites-en plus sur vous..." value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Site Web" placeholder="https://votresite.com" value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} icon={<Globe size={16} />} />
                <Input label="Telephone Support" placeholder="+225 07 XX XX XX XX" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} icon={<Phone size={16} />} />
              </div>

              <div className="pt-4 border-t-2 border-dashed border-slate-200">
                <h3 className="font-black text-sm uppercase mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </div>
                  Reseaux Sociaux
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase ml-1 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Facebook
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-xl border-2 border-black font-bold text-sm focus:shadow-pop-sm outline-none bg-slate-50"
                      placeholder="facebook.com/votrepage"
                      value={profile.facebook}
                      onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase ml-1 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><defs><linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FFDC80"/><stop offset="25%" stopColor="#FCAF45"/><stop offset="50%" stopColor="#F77737"/><stop offset="75%" stopColor="#F56040"/><stop offset="100%" stopColor="#C13584"/></linearGradient></defs><path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      Instagram
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-xl border-2 border-black font-bold text-sm focus:shadow-pop-sm outline-none bg-slate-50"
                      placeholder="instagram.com/votrecompte"
                      value={profile.instagram}
                      onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase ml-1 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                      TikTok
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-xl border-2 border-black font-bold text-sm focus:shadow-pop-sm outline-none bg-slate-50"
                      placeholder="tiktok.com/@votrecompte"
                      value={profile.tiktok}
                      onChange={(e) => setProfile({ ...profile, tiktok: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200 flex items-start">
                <div className="bg-white p-1.5 rounded-lg border border-blue-200 mr-3 text-blue-600">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="font-black text-blue-900 text-sm uppercase">Comptes de retrait</h4>
                  <p className="text-xs font-bold text-blue-700 mt-1">Nous utiliserons ces infos pour vos retraits.</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-black text-sm uppercase border-b border-slate-100 pb-2">Mobile Money</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase ml-1">Pays / Indicatif</label>
                    <div className="flex gap-2 items-center">
                      <select
                        className="px-3 py-2 rounded-xl border-2 border-black font-bold text-sm bg-white cursor-pointer"
                        value={phoneCountry.code}
                        onChange={(e) => {
                          const found = countries.find((c) => c.code === e.target.value) || countries[0];
                          setPhoneCountry(found);
                        }}
                      >
                        {countries.map((c) => (
                          <option key={c.code} value={c.code}>{c.flag} {c.label} ({c.dial})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase ml-1">Numero Wave</label>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-2 rounded-xl border-2 border-black font-black text-sm bg-slate-50">{phoneCountry.dial}</div>
                      <input
                        className="flex-1 px-3 py-2 rounded-xl border-2 border-black font-bold text-sm"
                        placeholder="07 XX XX XX XX"
                        value={payouts.wave.replace(phoneCountry.dial, '')}
                        onChange={(e) => setPayouts({ ...payouts, wave: `${phoneCountry.dial}${e.target.value.replace(/\\D/g, '')}` })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase ml-1">Numero Orange Money</label>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-2 rounded-xl border-2 border-black font-black text-sm bg-slate-50">{phoneCountry.dial}</div>
                      <input
                        className="flex-1 px-3 py-2 rounded-xl border-2 border-black font-bold text-sm"
                        placeholder="07 XX XX XX XX"
                        value={payouts.om.replace(phoneCountry.dial, '')}
                        onChange={(e) => setPayouts({ ...payouts, om: `${phoneCountry.dial}${e.target.value.replace(/\\D/g, '')}` })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase ml-1">Numero MTN</label>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-2 rounded-xl border-2 border-black font-black text-sm bg-slate-50">{phoneCountry.dial}</div>
                      <input
                        className="flex-1 px-3 py-2 rounded-xl border-2 border-black font-bold text-sm"
                        placeholder="05 XX XX XX XX"
                        value={payouts.mtn.replace(phoneCountry.dial, '')}
                        onChange={(e) => setPayouts({ ...payouts, mtn: `${phoneCountry.dial}${e.target.value.replace(/\\D/g, '')}` })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="font-black text-sm uppercase border-b border-slate-100 pb-2">Virement Bancaire</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Nom de la Banque" placeholder="Ex: NSIA Banque" value={payouts.bankName} onChange={(e) => setPayouts({ ...payouts, bankName: e.target.value })} />
                  <Input label="Code IBAN" placeholder="CI..." value={payouts.iban} onChange={(e) => setPayouts({ ...payouts, iban: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <h3 className="font-black text-sm uppercase">Mot de passe</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input label="Mot de passe actuel" type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nouveau mot de passe" type="password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} />
                    <Input label="Confirmer" type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                  </div>
                </div>
                {secError && <p className="text-red-600 text-sm font-bold">{secError}</p>}
                <Button variant="secondary" onClick={handleChangePassword} isLoading={secLoading}>
                  Mettre a jour le mot de passe
                </Button>
              </div>

              <div className="space-y-4 pt-4 border-t-2 border-dashed border-slate-200">
                <h3 className="font-black text-sm uppercase">Notifications</h3>
                <ToggleRow
                  label="Alerte nouvelle vente"
                  checked={notifications.saleAlert}
                  onChange={(v) => setNotifications({ ...notifications, saleAlert: v })}
                  icon={<Bell size={18} className="mr-3 text-slate-500" />}
                />
                <ToggleRow
                  label="Alerte connexion inconnue"
                  checked={notifications.loginAlert}
                  onChange={(v) => setNotifications({ ...notifications, loginAlert: v })}
                  icon={<Shield size={18} className="mr-3 text-slate-500" />}
                />
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t-2 border-black flex justify-end">
            <Button onClick={saveAll} isLoading={isLoading} variant="primary" icon={<Save size={18} />}>
              Enregistrer les modifications
            </Button>
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
}

function TabButton({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center transition-all ${
        active ? 'bg-slate-900 text-white shadow-pop-sm' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  icon,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <label className="flex items-center justify-between p-3 rounded-xl border-2 border-slate-100 bg-slate-50 cursor-pointer hover:border-black transition-colors">
      <div className="flex items-center">
        {icon}
        <span className="font-bold text-sm">{label}</span>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        className={`w-12 h-6 rounded-full border-2 border-black transition-colors relative ${
          checked ? 'bg-green-400' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white border-2 border-black rounded-full transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}
