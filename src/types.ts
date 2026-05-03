export interface Creator {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  threadsUrl?: string;
  twitterUrl?: string;
}

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  ingredients: string[];
  steps: string[];
  category: Category;
  imageUrl: string;
  youtubeId?: string;
  instagramUrl?: string;
  likes: number;
  featured: boolean;
  createdAt: number;
  creatorId?: string;
}

export type Category = 'Drinks' | 'Healthy' | 'Shakes' | 'Fast Food' | 'Desserts' | 'Traditional';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: number;
}

export interface CollaborationRequest {
  id: string;
  brandName: string;
  contactPerson: string;
  email: string;
  budget: string;
  message: string;
  createdAt: number;
}
