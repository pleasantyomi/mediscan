/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Scan, History, Pill, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Mock database of drug information with added manufacture and expiry dates
export const drugDatabase = {
  MED001: {
    id: "MED001",
    name: "Acetaminophen",
    description:
      "Pain reliever and fever reducer used for mild to moderate pain relief.",
    manufactureDate: "2023-06-15",
    expiryDate: "2025-06-15",
  },
  MED002: {
    id: "MED002",
    name: "Amoxicillin",
    description: "Antibiotic used to treat a variety of bacterial infections.",
    manufactureDate: "2023-03-10",
    expiryDate: "2024-03-10",
  },
  MED003: {
    id: "MED003",
    name: "Lisinopril",
    description:
      "ACE inhibitor used to treat high blood pressure and heart failure.",
    manufactureDate: "2023-09-22",
    expiryDate: "2026-09-22",
  },
  MED004: {
    id: "MED004",
    name: "Loratadine",
    description:
      "Non-drowsy antihistamine used to treat allergy symptoms such as sneezing, runny nose, and itchy eyes.",
    manufactureDate: "2024-01-18",
    expiryDate: "2026-01-18",
  },
  MED005: {
    id: "MED005",
    name: "Ibuprofen",
    description:
      "Nonsteroidal anti-inflammatory drug (NSAID) used to relieve pain, reduce inflammation, and lower fever.",
    manufactureDate: "2023-11-05",
    expiryDate: "2025-11-05",
  },
  MED006: {
    id: "MED006",
    name: "Metformin",
    description:
      "Oral diabetes medication used to control blood sugar levels in people with type 2 diabetes.",
    manufactureDate: "2023-07-12",
    expiryDate: "2025-07-12",
  },
}

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; name: string; description: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      setIsSearching(true);
      // Filter drugs based on search query
      const results = Object.entries(drugDatabase)
        .filter(
          ([_, drug]) =>
            drug.name.toLowerCase().includes(query.toLowerCase()) ||
            drug.id.toLowerCase().includes(query.toLowerCase())
        )
        .map(([id, drug]) => ({
          id,
          name: drug.name,
          description: drug.description,
        }));

      setSearchResults(results);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  // Handle search result click
  const handleResultClick = (id: string) => {
    router.push(`/scanner?id=${id}`);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleResultClick(searchResults[0].id);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen p-4 bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Logo and Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-12 mb-8 text-center"
      >
        <div className="flex items-center justify-center mb-2">
          <Pill className="w-8 h-8 mr-2 text-primary" />
          <h1 className="text-4xl font-bold text-primary">MediScan</h1>
        </div>
        <p className="max-w-md mx-auto text-gray-600">
          Search for medication information or scan a barcode to get detailed
          drug information
        </p>
      </motion.div>

      {/* Search Bar and Scanner Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative w-full max-w-2xl mx-auto"
      >
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center overflow-hidden bg-white border-2 rounded-full shadow-md focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
            <Search className="w-5 h-5 ml-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for a medication..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Link href="/scanner">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="mr-1 text-gray-500 hover:text-primary"
              >
                <Scan className="w-5 h-5" />
                <span className="sr-only">Scan barcode</span>
              </Button>
            </Link>
          </div>
        </form>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {isSearching && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-2 overflow-hidden bg-white border rounded-lg shadow-lg"
            >
              <ul className="py-1">
                {searchResults.map((result) => (
                  <motion.li
                    key={result.id}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                    className="cursor-pointer"
                    onClick={() => handleResultClick(result.id)}
                  >
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-primary">
                          {result.name}
                        </div>
                        <div className="text-xs text-gray-500">{result.id}</div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {result.description}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {isSearching && searchResults.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg"
            >
              <div className="p-4 text-center text-gray-500">
                No medications found matching &quot;{searchQuery}&quot;
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col w-full max-w-md gap-4 mx-auto mt-8 sm:flex-row"
      >
        <Link href="/scanner" className="flex-1">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-between p-4 transition-colors bg-white border border-gray-100 shadow-md rounded-xl hover:border-primary/30"
          >
            <div className="flex items-center">
              <div className="p-2 mr-3 rounded-full bg-primary/10">
                <Scan className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Scan Barcode</h3>
              </div>
            </div>
          </motion.div>
        </Link>

        <Link href="/history" className="flex-1">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-between p-4 transition-colors bg-white border border-gray-100 shadow-md rounded-xl hover:border-primary/30"
          >
            <div className="flex items-center">
              <div className="p-2 mr-3 rounded-full bg-primary/10">
                <History className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">History</h3>
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Generate Barcode Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-6"
      >
        {/* <Link href="/generate">
          <Button variant="link" className="text-primary">
            Generate Test Barcodes
          </Button>
        </Link> */}
      </motion.div>
    </main>
  );
}
