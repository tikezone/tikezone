
export interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
  available?: number;
}

export type TicketTierStyle = 'standard' | 'grand-public' | 'vip' | 'vvip' | 'premium' | 'early-bird';

export type PromoType = 'none' | 'percentage' | 'fixed_price';

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
  style: TicketTierStyle; // Visual styling theme
  tag?: string; // Custom badge text (e.g. "EARLY BIRD")
  // New Promotion Fields
  promoType?: PromoType;
  promoValue?: number; // Either percentage (e.g. 20 for 20%) or fixed price (e.g. 5000)
  promoCode?: string; // Optional code to unlock (if empty, applied to everyone)
  
  // Runtime field for availability (compatibility with EventDetail)
  available?: number;
}

export interface Event {
  id: string;
  title: string;
  date: string; // ISO date string
  time?: string; // HH:mm (used for creation form)
  location: string;
  price: number;
  imageUrl: string; // Main cover image
  images?: string[]; // Gallery images
  videoUrl?: string; // Add videoUrl for hover effect
  category: CategoryId;
  organizer: string;
  slug?: string; // Custom URL slug (e.g. "didib-concert")
  description?: string;
  isPopular?: boolean;
  isPromo?: boolean;
  discountPercent?: number;
  isTrending?: boolean;
  isFeatured?: boolean; // flag super admin: "A la une"
  isEventOfYear?: boolean; // flag super admin: "Évènement de l'année"
  isVerified?: boolean; // flag super admin: contenu validé
  // Champs spécifiques (ex. plage)
  spot?: string;
  djLineup?: string;
  dressCode?: string;
  waterSecurity?: string;
  ticketTypes?: TicketTier[]; // Used for fetching events
  availableTickets?: number;
  visibility?: 'public' | 'private';
  accessCode?: string;
  status?: 'published' | 'draft' | 'archived'; // Add status
}

export type CategoryId = 'all' | 'concert' | 'culture' | 'soiree' | 'formation' | 'sport' | 'tourisme' | 'festival' | 'science' | 'religieux' | 'corporate';

export interface Category {
  id: CategoryId;
  label: string;
  iconName: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentMethod: 'wave' | 'om' | 'mtn' | 'card';
  deliveryMethod: 'email' | 'whatsapp';
}

export type DateFilter = 'all' | 'today' | 'tomorrow' | 'weekend';
export type PriceFilter = 'all' | 'free' | 'under-5000' | 'under-10000' | 'premium';
