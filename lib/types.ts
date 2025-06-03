export interface DrugInfo {
  id: string;
  name: string;
  description: string;
  dosage: string;
  sideEffects: string[];
  manufactureDate: string;
  expiryDate: string;
  prices?: PriceInfo[];
}

export interface PriceInfo {
  pharmacy: string;
  price: number;
  lastUpdated: string;
  location?: string;
}

export interface FeedbackInfo {
  id: string;
  drugId: string;
  rating: number;
  comment: string;
  priceInfo?: {
    pharmacy: string;
    price: number;
    location?: string;
  };
  timestamp: string;
}
