/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Pill, AlertTriangle, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

// Mock database of drug information (same as in scanner page)
const drugDatabase: Record<string, any> = {
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
    expiryDate: "2024-03-10", // Expired date (assuming current date is after this)
  },
  MED003: {
    id: "MED003",
    name: "Lisinopril",
    description:
      "ACE inhibitor used to treat high blood pressure and heart failure.",
    manufactureDate: "2023-09-22",
    expiryDate: "2026-09-22",
  },
};

export default function HistoryPage() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const savedHistory = JSON.parse(
      localStorage.getItem("scanHistory") || "[]"
    );
    setHistory(savedHistory);
  }, []);

  // Check if a drug is expired
  const isExpired = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return today > expiry;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container max-w-md p-4 mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <Link
          href="/"
          className="flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-2 border-gray-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Scan History
            </CardTitle>
            <CardDescription>
              Your recently scanned medication barcodes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <AnimatePresence>
              {history.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {history.map((id, index) => {
                    const drug = drugDatabase[id];
                    const expired = drug ? isExpired(drug.expiryDate) : false;

                    return (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link href={`/scanner?id=${id}`}>
                          <div
                            className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-start ${
                              expired ? "border-red-200 bg-red-50" : ""
                            }`}
                          >
                            <div
                              className={`p-2 rounded-full mr-3 ${
                                expired ? "bg-red-100" : "bg-primary/10"
                              }`}
                            >
                              <Pill
                                className={`h-5 w-5 ${
                                  expired ? "text-red-500" : "text-primary"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h3
                                  className={`font-medium ${
                                    expired ? "text-red-600" : "text-primary"
                                  }`}
                                >
                                  {drug?.name || "Unknown Medication"}
                                </h3>
                                {expired && (
                                  <Badge
                                    variant="destructive"
                                    className="ml-2 text-xs"
                                  >
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Expired
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">ID: {id}</p>
                              {drug && (
                                <>
                                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                    {drug.description}
                                  </p>
                                  <div className="flex items-center mt-2 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <span>
                                      Expires: {formatDate(drug.expiryDate)}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center text-gray-500"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-center w-16 h-16 p-4 mx-auto mb-4 rounded-full bg-gray-50"
                  >
                    <Clock className="w-8 h-8 text-gray-400" />
                  </motion.div>
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    No scan history found
                  </motion.p>
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 text-sm"
                  >
                    Scan a barcode to see it here
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
