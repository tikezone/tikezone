'use client';

import React from 'react';
import Input from '../UI/Input';
import {
  Music,
  Mic2,
  Shirt,
  UserCheck,
  Award,
  Map,
  Bus,
  Tent,
  Microscope,
  Theater,
  BookOpen,
  Heart,
  Users,
  Gamepad2,
  Coffee,
  Sun,
  Palette,
  Briefcase,
  Utensils,
  Baby,
} from 'lucide-react';

interface EventTypeFieldsProps {
  eventType: string;
  onChange: (field: string, value: any) => void;
  data: any;
}

const EventTypeFields: React.FC<EventTypeFieldsProps> = ({ eventType, onChange, data }) => {
  const renderFields = () => {
    switch (eventType) {
      // --- OFFICIAL TYPES ---
      case 'concert':
        return (
          <>
            <Input label="Line-up / Artistes" placeholder="Ex: Fally Ipupa, Didi B..." icon={<Mic2 size={18} />} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Type de scène" placeholder="Ex: 360°, Frontale" />
              <Input label="Ouverture des portes" type="time" />
            </div>
            <Input label="Régie Technique" placeholder="Besoin spécifique (Son/Lumière)" />
          </>
        );
      case 'soiree':
        return (
          <>
            <Input label="Dress Code" placeholder="Ex: All White, Chic & Glamour" icon={<Shirt size={18} />} />
            <Input label="DJ Line-up" placeholder="DJ Arafat Jr, DJ Kerozen..." icon={<Music size={18} />} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Pré-requis" placeholder="Sur liste / Bracelet" />
              <Input label="Ambiance" placeholder="Chill, Clubbing, Lounge" />
            </div>
          </>
        );
      case 'formation':
        return (
          <>
            <Input label="Niveau requis" placeholder="Débutant, Intermédiaire, Expert" icon={<Award size={18} />} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Durée totale" placeholder="Ex: 3 jours" />
              <Input label="Matériel requis" placeholder="Laptop, Bloc-notes..." />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" className="w-5 h-5 accent-brand-600" id="cert" />
              <label htmlFor="cert" className="text-sm font-bold text-slate-700">
                Certificat / Attestation inclus
              </label>
            </div>
          </>
        );
      case 'sport':
        return (
          <>
            <Input label="Catégorie Sportive" placeholder="Football, Marathon, Crossfit..." icon={<Award size={18} />} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Type de compétition" placeholder="Amical, Tournoi, Ligue" />
              <Input label="Niveau" placeholder="Amateur, Pro" />
            </div>
            <Input label="Sécurité / Médical" placeholder="Dispositif prévu..." icon={<Heart size={18} />} />
          </>
        );
      case 'tourisme':
        return (
          <>
            <Input label="Point de départ" placeholder="Gare, Aéroport..." icon={<Map size={18} />} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Difficulté" placeholder="Facile, Marcheur, Expert" />
              <Input label="Durée" placeholder="Ex: 1 semaine" />
            </div>
            <Input label="Inclus" placeholder="Transport, Repas, Guide..." icon={<Bus size={18} />} />
          </>
        );
      case 'festival':
        return (
          <>
            <Input label="Line-up (Multi-jours)" placeholder="Liste des artistes..." icon={<Music size={18} />} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Zones disponibles" placeholder="Camping, Village Food, VIP" icon={<Tent size={18} />} />
              <Input label="Types de Pass" placeholder="Pass 1J, Pass 3J..." />
            </div>
          </>
        );
      case 'science':
        return (
          <>
            <Input label="Domaine Scientifique" placeholder="Astronomie, Biologie, Tech..." icon={<Microscope size={18} />} />
            <Input label="Intervenants / Chercheurs" placeholder="Noms des experts" />
            <Input label="Matériel requis" placeholder="Blouse, Lunettes..." />
          </>
        );
      case 'culture':
        return (
          <>
            <Input label="Type Culturel" placeholder="Théâtre, Danse, Cinéma..." icon={<Theater size={18} />} />
            <Input label="Distribution / Casting" placeholder="Acteurs, Danseurs..." />
            <Input label="Synopsis court" placeholder="De quoi ça parle ?" />
          </>
        );
      case 'religieux':
        return (
          <>
            <Input label="Type de rassemblement" placeholder="Veillée, Conférence, Retraite" icon={<BookOpen size={18} />} />
            <Input label="Intervenants / Prédicateurs" placeholder="Noms..." />
            <Input label="Tenue recommandée" placeholder="Ex: Tenue blanche, Modeste" />
          </>
        );

      // --- INTERNATIONAL TYPES ---
      case 'food':
        return (
          <>
            <Input label="Type de Cuisine" placeholder="Africaine, Asiatique, Street Food..." icon={<Utensils size={18} />} />
            <Input label="Chefs Invités" placeholder="Noms des chefs..." />
            <Input label="Allergènes / Restrictions" placeholder="Halal, Végétarien, Sans gluten..." />
          </>
        );
      case 'business':
        return (
          <>
            <Input label="Thématique Business" placeholder="Tech, Finance, Immo..." icon={<Briefcase size={18} />} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Intervenants" placeholder="CEO, Experts..." />
              <Input label="Dress Code" placeholder="Business Casual, Formal" />
            </div>
          </>
        );
      case 'mode':
        return (
          <>
            <Input label="Designer / Marque" placeholder="Nom du créateur..." icon={<Palette size={18} />} />
            <Input label="Collection" placeholder="Saison, Thème..." />
            <Input label="Type de Runway" placeholder="Podium classique, Immersif..." />
          </>
        );
      case 'famille':
        return (
          <>
            <Input label="Âges recommandés" placeholder="Ex: 3-10 ans" icon={<Baby size={18} />} />
            <Input label="Animations prévues" placeholder="Clowns, Ateliers, Jeux..." />
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" className="w-5 h-5 accent-brand-600" id="parents" />
              <label htmlFor="parents" className="text-sm font-bold text-slate-700">
                Zone Parents incluse
              </label>
            </div>
          </>
        );
      case 'gaming':
        return (
          <>
            <Input label="Jeu(x) concerné(s)" placeholder="FIFA, LoL, Street Fighter..." icon={<Gamepad2 size={18} />} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Type" placeholder="Tournoi, LAN, Exhibition" />
              <Input label="Plateforme" placeholder="PS5, PC, Mobile" />
            </div>
            <Input label="Matériel à apporter" placeholder="Manette, Casque..." />
          </>
        );
      case 'afterwork':
        return (
          <>
            <Input label="Entreprise Hôte" placeholder="Nom de la société..." icon={<Coffee size={18} />} />
            <Input label="Type de Networking" placeholder="Speed meeting, Cocktail..." />
            <Input label="Ambiance" placeholder="Détente, Pro..." />
          </>
        );
      case 'beach':
        return (
          <>
            <Input
              label="Spot / Plage"
              placeholder="Nom de la plage..."
              icon={<Sun size={18} />}
              value={data.spot || ''}
              onChange={(e) => onChange('spot', e.target.value)}
            />
            <Input
              label="DJ Line-up"
              placeholder="DJs..."
              value={data.djLineup || ''}
              onChange={(e) => onChange('djLineup', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Dress Code"
                placeholder="Maillot, Beach wear"
                value={data.dressCode || ''}
                onChange={(e) => onChange('dressCode', e.target.value)}
              />
              <Input
                label="Sécurité Eau"
                placeholder="Maîtres nageurs ?"
                value={data.waterSecurity || ''}
                onChange={(e) => onChange('waterSecurity', e.target.value)}
              />
            </div>
          </>
        );
      case 'charity':
        return (
          <>
            <Input label="Cause soutenue" placeholder="Éducation, Santé, Écologie..." icon={<Heart size={18} />} />
            <Input label="ONG / Partenaires" placeholder="Noms des organisations..." />
            <Input label="Objectif de levée" placeholder="Montant espéré..." />
          </>
        );
      case 'expo':
        return (
          <>
            <Input label="Artistes exposés" placeholder="Peintres, Sculpteurs..." icon={<Palette size={18} />} />
            <Input label="Thème de l'expo" placeholder="Abstrait, Histoire, Nature..." />
            <Input label="Type d'art" placeholder="Peinture, Photo, Sculpture..." />
          </>
        );
      case 'masterclass':
        return (
          <>
            <Input label="Expert / Formateur" placeholder="Nom de l'expert..." icon={<UserCheck size={18} />} />
            <Input label="Objectif pédagogique" placeholder="Ce que l'on va apprendre..." />
            <Input label="Matériel requis" placeholder="Notepad, Laptop..." />
          </>
        );

      // --- DEFAULT ---
      default:
        return (
          <>
            <Input label="Public cible" placeholder="Tout public, Adultes..." icon={<Users size={18} />} />
            <Input label="Règles d'accès" placeholder="Conditions particulières..." />
          </>
        );
    }
  };

  return (
    <div className="bg-slate-50 border-2 border-black border-dashed rounded-xl p-5 mt-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
        <h4 className="text-sm font-black uppercase text-slate-500 tracking-wider">Détails spécifiques : {eventType.toUpperCase()}</h4>
      </div>
      <div className="space-y-4">{renderFields()}</div>
    </div>
  );
};

export default EventTypeFields;
