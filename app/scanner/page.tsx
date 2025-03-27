/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Camera, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface DrugInfo {
  id: string;
  name: string;
  description: string;
  dosage: string;
  sideEffects: string[];
}

function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [scannerId, setScannerId] = useState<string | null>(null);
  const drugDatabase: Record<string, DrugInfo> = {
    MED001: {
      id: "MED001",
      name: "Acetaminophen",
      description:
        "Pain reliever and fever reducer used for mild to moderate pain relief.",
      dosage:
        "325-650mg every 4-6 hours as needed. Do not exceed 3000mg per day.",
      sideEffects: [
        "Nausea",
        "Stomach pain",
        "Loss of appetite",
        "Headache",
        "Rash",
      ],
    },
    MED002: {
      id: "MED002",
      name: "Amoxicillin",
      description:
        "Antibiotic used to treat a variety of bacterial infections.",
      dosage:
        "250-500mg every 8 hours or 500-875mg every 12 hours, depending on infection severity.",
      sideEffects: ["Diarrhea", "Stomach pain", "Nausea", "Vomiting", "Rash"],
    },
    MED003: {
      id: "MED003",
      name: "Lisinopril",
      description:
        "ACE inhibitor used to treat high blood pressure and heart failure.",
      dosage:
        "10-40mg once daily. May start with lower dose of 5mg in some patients.",
      sideEffects: [
        "Dizziness",
        "Headache",
        "Dry cough",
        "Fatigue",
        "Hypotension",
      ],
    },
  };

  const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        // Check camera permissions
        const permission = await navigator.permissions.query({
          name: "camera" as any,
        });

        if (permission.state === "denied") {
          setError(
            "Camera access is denied. Please enable it in your browser settings."
          );
          return;
        } else if (permission.state === "prompt") {
          await navigator.mediaDevices.getUserMedia({ video: true }); // Triggers prompt
        }

        setScanning(true);
        setDrugInfo(null);
        setError(null);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions.");
      }

      if (!readerRef.current) return;

      html5QrCode = new Html5Qrcode("reader"); // Use the correct ID
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            html5QrCode?.stop();
            setScanning(false);

            if (drugDatabase[decodedText]) {
              setDrugInfo(drugDatabase[decodedText]);
              setScannerId(decodedText);
              setError(null);

              // Save to history
              const history = JSON.parse(
                localStorage.getItem("scanHistory") || "[]"
              );
              if (!history.includes(decodedText)) {
                history.unshift(decodedText);
                localStorage.setItem(
                  "scanHistory",
                  JSON.stringify(history.slice(0, 10))
                );
              }
            } else {
              setError(`No information found for code: ${decodedText}`);
              setDrugInfo(null);
            }
          },
          (error) => {
            console.error("Error decoding QR code:", error);
          }
        );
        setScanning(true);
      } catch (err) {
        console.error("Error starting scanner:", err);
        setError("Could not access camera. Please check permissions.");
      }
    };

    if (scanning) {
      startScanner();
    }

    return () => {
      if (html5QrCode) {
        html5QrCode
          .stop()
          .catch((error) => console.error("Error stopping scanner:", error));
      }
    };
  }, [scanning]);

  const handleStartScan = () => {
    setScanning(true);
    setDrugInfo(null);
    setError(null);
  };

  const handleStopScan = () => {
    setScanning(false);
  };

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
          className="flex items-center text-[#101010] hover:underline"
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
          <CardHeader className="bg-gradient-to-r from-[#101010]/10 to-[#101010]/5">
            <CardTitle>QR Code Scanner</CardTitle>
            <CardDescription>
              Scan a medication QR code to view detailed information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {scanning ? (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <div
                      id="reader"
                      ref={readerRef}
                      className="w-full h-[300px] bg-gray-100 rounded-lg overflow-hidden"
                    ></div>
                    <motion.div
                      className="absolute inset-0 pointer-events-none border-2 border-[#101010] rounded-lg"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(59, 130, 246, 0)",
                          "0 0 0 10px rgba(59, 130, 246, 0)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="destructive"
                      onClick={handleStopScan}
                      className="w-full"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Stop Scanning
                    </Button>
                  </motion.div>
                </motion.div>
              ) : drugInfo ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="font-semibold text-lg text-[#101010]">
                      {drugInfo.name}
                    </h3>
                    <p className="text-sm text-gray-500">ID: {drugInfo.id}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <h4 className="font-medium text-gray-700">Description</h4>
                    <p className="text-sm mt-1">{drugInfo.description}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <h4 className="font-medium text-gray-700">Dosage</h4>
                    <p className="text-sm mt-1">{drugInfo.dosage}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <h4 className="font-medium text-gray-700">Side Effects</h4>
                    <ul className="list-disc list-inside text-sm mt-1">
                      {drugInfo.sideEffects.map((effect, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          {effect}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  {error ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 mb-4 p-3 bg-red-50 rounded-lg"
                    >
                      {error}
                    </motion.div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-gray-500 mb-4"
                    >
                      No QR code scanned yet
                    </motion.p>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      onClick={handleStartScan}
                      className="mx-auto bg-[#101010] hover:bg-[#101010]/90 text-white"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Start Scanning
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
          {drugInfo && (
            <CardFooter className="bg-gray-50 border-t">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Button onClick={handleStartScan} className="w-full">
                  Scan Another Code
                </Button>
              </motion.div>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

export default ScannerPage;
