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
      case 'concert':
        return (
          <>
            <Input 
              label="Line-up / Artistes" 
              placeholder="Ex: Fally Ipupa, Didi B..." 
              icon={<Mic2 size={18} />}
              value={data.lineup || ''}
              onChange={(e) => onChange('lineup', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Type de scène" 
                placeholder="Ex: 360°, Frontale"
                value={data.stageType || ''}
                onChange={(e) => onChange('stageType', e.target.value)}
              />
              <Input 
                label="Ouverture des portes" 
                type="time"
                value={data.doorsOpen || ''}
                onChange={(e) => onChange('doorsOpen', e.target.value)}
              />
            </div>
            <Input 
              label="Régie Technique" 
              placeholder="Besoin spécifique (Son/Lumière)"
              value={data.technicalNeeds || ''}
              onChange={(e) => onChange('technicalNeeds', e.target.value)}
            />
          </>
        );
      case 'soiree':
        return (
          <>
            <Input 
              label="Dress Code" 
              placeholder="Ex: All White, Chic & Glamour" 
              icon={<Shirt size={18} />}
              value={data.dressCode || ''}
              onChange={(e) => onChange('dressCode', e.target.value)}
            />
            <Input 
              label="DJ Line-up" 
              placeholder="DJ Arafat Jr, DJ Kerozen..." 
              icon={<Music size={18} />}
              value={data.djLineup || ''}
              onChange={(e) => onChange('djLineup', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Pré-requis" 
                placeholder="Sur liste / Bracelet"
                value={data.prerequisites || ''}
                onChange={(e) => onChange('prerequisites', e.target.value)}
              />
              <Input 
                label="Ambiance" 
                placeholder="Chill, Clubbing, Lounge"
                value={data.ambiance || ''}
                onChange={(e) => onChange('ambiance', e.target.value)}
              />
            </div>
          </>
        );
      case 'formation':
        return (
          <>
            <Input 
              label="Niveau requis" 
              placeholder="Débutant, Intermédiaire, Expert" 
              icon={<Award size={18} />}
              value={data.skillLevel || ''}
              onChange={(e) => onChange('skillLevel', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Durée totale" 
                placeholder="Ex: 3 jours"
                value={data.duration || ''}
                onChange={(e) => onChange('duration', e.target.value)}
              />
              <Input 
                label="Matériel requis" 
                placeholder="Laptop, Bloc-notes..."
                value={data.requiredMaterial || ''}
                onChange={(e) => onChange('requiredMaterial', e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-brand-600" 
                id="cert"
                checked={data.hasCertificate || false}
                onChange={(e) => onChange('hasCertificate', e.target.checked)}
              />
              <label htmlFor="cert" className="text-sm font-bold text-slate-700">
                Certificat / Attestation inclus
              </label>
            </div>
          </>
        );
      case 'sport':
        return (
          <>
            <Input 
              label="Catégorie Sportive" 
              placeholder="Football, Marathon, Crossfit..." 
              icon={<Award size={18} />}
              value={data.sportCategory || ''}
              onChange={(e) => onChange('sportCategory', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Type de compétition" 
                placeholder="Amical, Tournoi, Ligue"
                value={data.competitionType || ''}
                onChange={(e) => onChange('competitionType', e.target.value)}
              />
              <Input 
                label="Niveau" 
                placeholder="Amateur, Pro"
                value={data.sportLevel || ''}
                onChange={(e) => onChange('sportLevel', e.target.value)}
              />
            </div>
            <Input 
              label="Sécurité / Médical" 
              placeholder="Dispositif prévu..." 
              icon={<Heart size={18} />}
              value={data.securityMedical || ''}
              onChange={(e) => onChange('securityMedical', e.target.value)}
            />
          </>
        );
      case 'tourisme':
        return (
          <>
            <Input 
              label="Point de départ" 
              placeholder="Gare, Aéroport..." 
              icon={<Map size={18} />}
              value={data.departurePoint || ''}
              onChange={(e) => onChange('departurePoint', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Difficulté" 
                placeholder="Facile, Marcheur, Expert"
                value={data.difficulty || ''}
                onChange={(e) => onChange('difficulty', e.target.value)}
              />
              <Input 
                label="Durée" 
                placeholder="Ex: 1 semaine"
                value={data.tripDuration || ''}
                onChange={(e) => onChange('tripDuration', e.target.value)}
              />
            </div>
            <Input 
              label="Inclus" 
              placeholder="Transport, Repas, Guide..." 
              icon={<Bus size={18} />}
              value={data.included || ''}
              onChange={(e) => onChange('included', e.target.value)}
            />
          </>
        );
      case 'festival':
        return (
          <>
            <Input 
              label="Line-up (Multi-jours)" 
              placeholder="Liste des artistes..." 
              icon={<Music size={18} />}
              value={data.lineup || ''}
              onChange={(e) => onChange('lineup', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Zones disponibles" 
                placeholder="Camping, Village Food, VIP" 
                icon={<Tent size={18} />}
                value={data.zones || ''}
                onChange={(e) => onChange('zones', e.target.value)}
              />
              <Input 
                label="Types de Pass" 
                placeholder="Pass 1J, Pass 3J..."
                value={data.passTypes || ''}
                onChange={(e) => onChange('passTypes', e.target.value)}
              />
            </div>
          </>
        );
      case 'science':
        return (
          <>
            <Input 
              label="Domaine Scientifique" 
              placeholder="Astronomie, Biologie, Tech..." 
              icon={<Microscope size={18} />}
              value={data.scienceField || ''}
              onChange={(e) => onChange('scienceField', e.target.value)}
            />
            <Input 
              label="Intervenants / Chercheurs" 
              placeholder="Noms des experts"
              value={data.speakers || ''}
              onChange={(e) => onChange('speakers', e.target.value)}
            />
            <Input 
              label="Matériel requis" 
              placeholder="Blouse, Lunettes..."
              value={data.requiredMaterial || ''}
              onChange={(e) => onChange('requiredMaterial', e.target.value)}
            />
          </>
        );
      case 'culture':
        return (
          <>
            <Input 
              label="Type Culturel" 
              placeholder="Théâtre, Danse, Cinéma..." 
              icon={<Theater size={18} />}
              value={data.culturalType || ''}
              onChange={(e) => onChange('culturalType', e.target.value)}
            />
            <Input 
              label="Distribution / Casting" 
              placeholder="Acteurs, Danseurs..."
              value={data.cast || ''}
              onChange={(e) => onChange('cast', e.target.value)}
            />
            <Input 
              label="Synopsis court" 
              placeholder="De quoi ça parle ?"
              value={data.synopsis || ''}
              onChange={(e) => onChange('synopsis', e.target.value)}
            />
          </>
        );
      case 'religieux':
        return (
          <>
            <Input 
              label="Type de rassemblement" 
              placeholder="Veillée, Conférence, Retraite" 
              icon={<BookOpen size={18} />}
              value={data.gatheringType || ''}
              onChange={(e) => onChange('gatheringType', e.target.value)}
            />
            <Input 
              label="Intervenants / Prédicateurs" 
              placeholder="Noms..."
              value={data.speakers || ''}
              onChange={(e) => onChange('speakers', e.target.value)}
            />
            <Input 
              label="Tenue recommandée" 
              placeholder="Ex: Tenue blanche, Modeste"
              value={data.dressCode || ''}
              onChange={(e) => onChange('dressCode', e.target.value)}
            />
          </>
        );

      case 'food':
        return (
          <>
            <Input 
              label="Type de Cuisine" 
              placeholder="Africaine, Asiatique, Street Food..." 
              icon={<Utensils size={18} />}
              value={data.cuisineType || ''}
              onChange={(e) => onChange('cuisineType', e.target.value)}
            />
            <Input 
              label="Chefs Invités" 
              placeholder="Noms des chefs..."
              value={data.chefs || ''}
              onChange={(e) => onChange('chefs', e.target.value)}
            />
            <Input 
              label="Allergènes / Restrictions" 
              placeholder="Halal, Végétarien, Sans gluten..."
              value={data.allergens || ''}
              onChange={(e) => onChange('allergens', e.target.value)}
            />
          </>
        );
      case 'business':
        return (
          <>
            <Input 
              label="Thématique Business" 
              placeholder="Tech, Finance, Immo..." 
              icon={<Briefcase size={18} />}
              value={data.businessTheme || ''}
              onChange={(e) => onChange('businessTheme', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Intervenants" 
                placeholder="CEO, Experts..."
                value={data.speakers || ''}
                onChange={(e) => onChange('speakers', e.target.value)}
              />
              <Input 
                label="Dress Code" 
                placeholder="Business Casual, Formal"
                value={data.dressCode || ''}
                onChange={(e) => onChange('dressCode', e.target.value)}
              />
            </div>
          </>
        );
      case 'mode':
        return (
          <>
            <Input 
              label="Designer / Marque" 
              placeholder="Nom du créateur..." 
              icon={<Palette size={18} />}
              value={data.designer || ''}
              onChange={(e) => onChange('designer', e.target.value)}
            />
            <Input 
              label="Collection" 
              placeholder="Saison, Thème..."
              value={data.collection || ''}
              onChange={(e) => onChange('collection', e.target.value)}
            />
            <Input 
              label="Type de Runway" 
              placeholder="Podium classique, Immersif..."
              value={data.runwayType || ''}
              onChange={(e) => onChange('runwayType', e.target.value)}
            />
          </>
        );
      case 'famille':
        return (
          <>
            <Input 
              label="Âges recommandés" 
              placeholder="Ex: 3-10 ans" 
              icon={<Baby size={18} />}
              value={data.ageRange || ''}
              onChange={(e) => onChange('ageRange', e.target.value)}
            />
            <Input 
              label="Animations prévues" 
              placeholder="Clowns, Ateliers, Jeux..."
              value={data.animations || ''}
              onChange={(e) => onChange('animations', e.target.value)}
            />
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-brand-600" 
                id="parents"
                checked={data.hasParentZone || false}
                onChange={(e) => onChange('hasParentZone', e.target.checked)}
              />
              <label htmlFor="parents" className="text-sm font-bold text-slate-700">
                Zone Parents incluse
              </label>
            </div>
          </>
        );
      case 'gaming':
        return (
          <>
            <Input 
              label="Jeu(x) concerné(s)" 
              placeholder="FIFA, LoL, Street Fighter..." 
              icon={<Gamepad2 size={18} />}
              value={data.games || ''}
              onChange={(e) => onChange('games', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Type" 
                placeholder="Tournoi, LAN, Exhibition"
                value={data.gamingType || ''}
                onChange={(e) => onChange('gamingType', e.target.value)}
              />
              <Input 
                label="Plateforme" 
                placeholder="PS5, PC, Mobile"
                value={data.platform || ''}
                onChange={(e) => onChange('platform', e.target.value)}
              />
            </div>
            <Input 
              label="Matériel à apporter" 
              placeholder="Manette, Casque..."
              value={data.requiredMaterial || ''}
              onChange={(e) => onChange('requiredMaterial', e.target.value)}
            />
          </>
        );
      case 'afterwork':
        return (
          <>
            <Input 
              label="Entreprise Hôte" 
              placeholder="Nom de la société..." 
              icon={<Coffee size={18} />}
              value={data.hostCompany || ''}
              onChange={(e) => onChange('hostCompany', e.target.value)}
            />
            <Input 
              label="Type de Networking" 
              placeholder="Speed meeting, Cocktail..."
              value={data.networkingType || ''}
              onChange={(e) => onChange('networkingType', e.target.value)}
            />
            <Input 
              label="Ambiance" 
              placeholder="Détente, Pro..."
              value={data.ambiance || ''}
              onChange={(e) => onChange('ambiance', e.target.value)}
            />
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
            <Input 
              label="Cause soutenue" 
              placeholder="Éducation, Santé, Écologie..." 
              icon={<Heart size={18} />}
              value={data.cause || ''}
              onChange={(e) => onChange('cause', e.target.value)}
            />
            <Input 
              label="ONG / Partenaires" 
              placeholder="Noms des organisations..."
              value={data.partners || ''}
              onChange={(e) => onChange('partners', e.target.value)}
            />
            <Input 
              label="Objectif de levée" 
              placeholder="Montant espéré..."
              value={data.fundraisingGoal || ''}
              onChange={(e) => onChange('fundraisingGoal', e.target.value)}
            />
          </>
        );
      case 'expo':
        return (
          <>
            <Input 
              label="Artistes exposés" 
              placeholder="Peintres, Sculpteurs..." 
              icon={<Palette size={18} />}
              value={data.artists || ''}
              onChange={(e) => onChange('artists', e.target.value)}
            />
            <Input 
              label="Thème de l'expo" 
              placeholder="Abstrait, Histoire, Nature..."
              value={data.expoTheme || ''}
              onChange={(e) => onChange('expoTheme', e.target.value)}
            />
            <Input 
              label="Type d'art" 
              placeholder="Peinture, Photo, Sculpture..."
              value={data.artType || ''}
              onChange={(e) => onChange('artType', e.target.value)}
            />
          </>
        );
      case 'masterclass':
        return (
          <>
            <Input 
              label="Expert / Formateur" 
              placeholder="Nom de l'expert..." 
              icon={<UserCheck size={18} />}
              value={data.expert || ''}
              onChange={(e) => onChange('expert', e.target.value)}
            />
            <Input 
              label="Objectif pédagogique" 
              placeholder="Ce que l'on va apprendre..."
              value={data.learningObjective || ''}
              onChange={(e) => onChange('learningObjective', e.target.value)}
            />
            <Input 
              label="Matériel requis" 
              placeholder="Notepad, Laptop..."
              value={data.requiredMaterial || ''}
              onChange={(e) => onChange('requiredMaterial', e.target.value)}
            />
          </>
        );

      default:
        return (
          <>
            <Input 
              label="Public cible" 
              placeholder="Tout public, Adultes..." 
              icon={<Users size={18} />}
              value={data.targetAudience || ''}
              onChange={(e) => onChange('targetAudience', e.target.value)}
            />
            <Input 
              label="Règles d'accès" 
              placeholder="Conditions particulières..."
              value={data.accessRules || ''}
              onChange={(e) => onChange('accessRules', e.target.value)}
            />
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
