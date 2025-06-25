import { DrugInfo, FeedbackInfo } from "./types";

// Load feedback from localStorage
export function loadFeedback(): FeedbackInfo[] {
  if (typeof window === 'undefined') return [];
  const feedback = localStorage.getItem('drugFeedback');
  return feedback ? JSON.parse(feedback) : [];
}

// Save feedback to localStorage
export function saveFeedback(feedback: FeedbackInfo[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('drugFeedback', JSON.stringify(feedback));
}

// Add new feedback
export function addFeedback(newFeedback: Omit<FeedbackInfo, 'id' | 'timestamp'>): FeedbackInfo {
  const feedback = loadFeedback();
  const feedbackEntry: FeedbackInfo = {
    ...newFeedback,
    id: Math.random().toString(36).substring(2),
    timestamp: new Date().toISOString(),
  };
  
  feedback.unshift(feedbackEntry);
  saveFeedback(feedback);
  
  return feedbackEntry;
}

// Get feedback for a specific drug
export function getDrugFeedback(drugId: string): FeedbackInfo[] {
  const feedback = loadFeedback();
  return feedback.filter(f => f.drugId === drugId);
}

// Mock database of drug information
export const drugDatabase: Record<string, DrugInfo> = {
  MED001: {
    id: "MED001",
    name: "Acetaminophen",
    description: "Pain reliever and fever reducer used for mild to moderate pain relief.",
    dosage: "325-650mg every 4-6 hours as needed. Do not exceed 3000mg per day.",
    sideEffects: [
      "Nausea",
      "Stomach pain",
      "Loss of appetite",
      "Headache",
      "Rash",
    ],
    manufactureDate: "2023-06-15",
    expiryDate: "2025-06-15",
    prices: [
      {
        pharmacy: "CVS Pharmacy",
        price: 8.99,
        location: "Downtown",
        lastUpdated: "2025-06-01",
      },
      {
        pharmacy: "Walgreens",
        price: 7.49,
        location: "West Side",
        lastUpdated: "2025-06-01",
      },
      {
        pharmacy: "RiteMed",
        price: 9.99,
        location: "East Side",
        lastUpdated: "2025-05-30",
      },
    ],
  },
  MED002: {
    id: "MED002",
    name: "Amoxicillin",
    description: "Antibiotic used to treat a variety of bacterial infections.",
    dosage: "250-500mg every 8 hours or 500-875mg every 12 hours, depending on infection severity.",
    sideEffects: ["Diarrhea", "Stomach pain", "Nausea", "Vomiting", "Rash"],
    manufactureDate: "2023-03-10",
    expiryDate: "2024-03-10",
    prices: [
      {
        pharmacy: "CVS Pharmacy",
        price: 15.99,
        location: "Downtown",
        lastUpdated: "2025-06-01",
      },
      {
        pharmacy: "Walgreens",
        price: 14.49,
        location: "West Side",
        lastUpdated: "2025-06-01",
      },
    ],
  },
  MED003: {
    id: "MED003",
    name: "Lisinopril",
    description: "ACE inhibitor used to treat high blood pressure and heart failure.",
    dosage: "10-40mg once daily. May start with lower dose of 5mg in some patients.",
    sideEffects: [
      "Dizziness",
      "Headache",
      "Dry cough",
      "Fatigue",
      "Hypotension",
    ],
    manufactureDate: "2023-09-22",
    expiryDate: "2026-09-22",
    prices: [
      {
        pharmacy: "CVS Pharmacy",
        price: 12.99,
        location: "Downtown",
        lastUpdated: "2025-06-01",
      },
      {
        pharmacy: "Walgreens",
        price: 11.99,
        location: "West Side",
        lastUpdated: "2025-06-01",
      },
      {
        pharmacy: "RiteMed",
        price: 10.99,
        location: "East Side",
        lastUpdated: "2025-05-30",
      },
    ],
  },
MED004: {
    id: "MED004",
    name: "Loratadine",
    description: "Non-drowsy antihistamine used to treat allergy symptoms such as sneezing, runny nose, and itchy eyes.",
    dosage: "10mg once daily.",
    sideEffects: [
      "Headache",
      "Dry mouth",
      "Fatigue",
      "Sleepiness (rare)",
    ],
    manufactureDate: "2024-01-18",
    expiryDate: "2026-01-18",
    prices: [
      {
        pharmacy: "CVS Pharmacy",
        price: 6.99,
        location: "Downtown",
        lastUpdated: "2025-06-20",
      },
      {
        pharmacy: "Walgreens",
        price: 5.49,
        location: "West Side",
        lastUpdated: "2025-06-18",
      },
    ],
  },

  MED005: {
    id: "MED005",
    name: "Ibuprofen",
    description: "Nonsteroidal anti-inflammatory drug (NSAID) used to relieve pain, reduce inflammation, and lower fever.",
    dosage: "200-400mg every 4-6 hours as needed. Do not exceed 1200mg per day without medical advice.",
    sideEffects: [
      "Stomach pain",
      "Heartburn",
      "Nausea",
      "Dizziness",
      "Rash",
    ],
    manufactureDate: "2023-11-05",
    expiryDate: "2025-11-05",
    prices: [
      {
        pharmacy: "CVS Pharmacy",
        price: 9.49,
        location: "Downtown",
        lastUpdated: "2025-06-15",
      },
      {
        pharmacy: "Walgreens",
        price: 8.75,
        location: "West Side",
        lastUpdated: "2025-06-15",
      },
      {
        pharmacy: "RiteMed",
        price: 7.99,
        location: "East Side",
        lastUpdated: "2025-06-10",
      },
    ],
  },

  MED006: {
    id: "MED006",
    name: "Metformin",
    description: "Oral diabetes medication used to control blood sugar levels in people with type 2 diabetes.",
    dosage: "500-1000mg twice daily with meals. Maximum dose: 2000mg/day.",
    sideEffects: [
      "Diarrhea",
      "Nausea",
      "Metallic taste",
      "Abdominal discomfort",
      "Loss of appetite",
    ],
    manufactureDate: "2023-07-12",
    expiryDate: "2025-07-12",
    prices: [
      {
        pharmacy: "CVS Pharmacy",
        price: 10.99,
        location: "Downtown",
        lastUpdated: "2025-06-12",
      },
      {
        pharmacy: "Walgreens",
        price: 9.99,
        location: "West Side",
        lastUpdated: "2025-06-12",
      },
    ],
  },
} as const;
