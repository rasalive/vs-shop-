export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar?: string | null;
  phone?: string | null;
  role: string;
  status: string;
  walletBalance: number;
  totalSpent?: number;
  createdAt?: string | Date;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  coverImage?: string;
  stock?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image?: string | null;
  productCount: number;
}
