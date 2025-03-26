/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Pill } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

// Mock database of drug information (same as in scanner page)
const drugDatabase: Record<string, any> = {
  MED001: {
    id: "MED001",
    name: "Acetaminophen",
    description:
      "Pain reliever and fever reducer used for mild to moderate pain relief.",
  },
  MED002: {
    id: "MED002",
    name: "Amoxicillin",
    description: "Antibiotic used to treat a variety of bacterial infections.",
  },
  MED003: {
    id: "MED003",
    name: "Lisinopril",
    description:
      "ACE inhibitor used to treat high blood pressure and heart failure.",
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

  return (
    <div className="container mx-auto max-w-md p-4">
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
          <ArrowLeft className="mr-2 h-4 w-4" />
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
              <Clock className="mr-2 h-5 w-5" />
              Scan History
            </CardTitle>
            <CardDescription>
              Your recently scanned medication QR codes
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
                  {history.map((id, index) => (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link href={`/scanner?id=${id}`}>
                        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-start">
                          <div className="bg-primary/10 p-2 rounded-full mr-3">
                            <Pill className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-primary">
                              {drugDatabase[id]?.name || "Unknown Medication"}
                            </h3>
                            <p className="text-sm text-gray-500">ID: {id}</p>
                            {drugDatabase[id] && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {drugDatabase[id].description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-gray-500"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                  >
                    <Clock className="h-8 w-8 text-gray-400" />
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
                    className="text-sm mt-2"
                  >
                    Scan a QR code to see it here
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
