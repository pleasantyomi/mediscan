/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Camera, X, AlertTriangle, Calendar } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSearchParams } from "next/navigation";

interface DrugInfo {
  id: string;
  name: string;
  description: string;
  dosage: string;
  sideEffects: string[];
  manufactureDate: string;
  expiryDate: string;
}

// Mock database of drug information with added manufacture and expiry dates
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
    manufactureDate: "2023-06-15",
    expiryDate: "2025-06-15",
  },
  MED002: {
    id: "MED002",
    name: "Amoxicillin",
    description: "Antibiotic used to treat a variety of bacterial infections.",
    dosage:
      "250-500mg every 8 hours or 500-875mg every 12 hours, depending on infection severity.",
    sideEffects: ["Diarrhea", "Stomach pain", "Nausea", "Vomiting", "Rash"],
    manufactureDate: "2023-03-10",
    expiryDate: "2024-03-10", // Expired date (assuming current date is after this)
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
    manufactureDate: "2023-09-22",
    expiryDate: "2026-09-22",
  },
} as const;

export default function ScannerPage() {
  const searchParams = useSearchParams();
  const [scanning, setScanning] = useState(false);
  const [scannerId, setScannerId] = useState<string | null>(null);
  const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const scannerInitialized = useRef(false);

  // Check for ID in URL params (for direct navigation from search)
  useEffect(() => {
    const id = searchParams.get("id");
    if (id && drugDatabase[id]) {
      setDrugInfo(drugDatabase[id]);
      setScannerId(id);
    }
  }, [searchParams]);

  // Check if drug is expired
  useEffect(() => {
    if (drugInfo) {
      const today = new Date();
      const expiryDate = new Date(drugInfo.expiryDate);
      setIsExpired(today > expiryDate);
    }
  }, [drugInfo]);

  // Clean up scanner when component unmounts
  useEffect(() => {
    return () => {
      if (html5QrCode) {
        html5QrCode
          .stop()
          .catch((err) => console.error("Error stopping scanner:", err));
      }
    };
  }, [html5QrCode]);

  // Handle scanning state changes
  useEffect(() => {
    // Skip if not scanning or already initialized
    if (!scanning || scannerInitialized.current) return;

    let timeoutId: NodeJS.Timeout;

    const initializeScanner = async () => {
      try {
        // First stop any existing scanner
        if (html5QrCode) {
          await html5QrCode.stop();
          setHtml5QrCode(null);
        }

        // Check if the DOM element exists
        const readerElement = document.getElementById("reader");
        if (!readerElement) {
          console.log("Reader element not found, retrying...");
          // Retry after a short delay
          timeoutId = setTimeout(initializeScanner, 500);
          return;
        }

        console.log("Reader element found, initializing scanner");
        scannerInitialized.current = true;

        // Create a new scanner instance
        const newScanner = new Html5Qrcode("reader");
        setHtml5QrCode(newScanner);

        // Get the viewport dimensions for the barcode box
        const viewportWidth = Math.min(window.innerWidth, 500);

        // Configure scanner for barcodes - make the scanning area wider and shorter
        const config = {
          fps: 10,
          qrbox: { width: viewportWidth * 0.8, height: 100 }, // Wider and shorter for barcodes
          aspectRatio: window.innerHeight / window.innerWidth,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODABAR,
          ],
        };

        // Start scanning
        await newScanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            // Success callback
            handleBarcodeSuccess(decodedText, newScanner);
          },
          (errorMessage) => {
            // Error callback - we don't need to show these to the user
            console.log(errorMessage);
          }
        );
      } catch (err) {
        console.error("Error starting scanner:", err);
        setError(
          "Could not access camera. Please check permissions and try again."
        );
        setScanning(false);
        scannerInitialized.current = false;
      }
    };

    // Request camera permission and initialize scanner
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        initializeScanner();
      })
      .catch((err) => {
        console.error("Camera permission denied:", err);
        setError(
          "Camera access denied. Please check your browser permissions."
        );
        setScanning(false);
        scannerInitialized.current = false;
      });

    // Clean up timeout if component unmounts or dependencies change
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [scanning, html5QrCode]);

  // Reset initialization flag when scanning is stopped
  useEffect(() => {
    if (!scanning) {
      scannerInitialized.current = false;
    }
  }, [scanning]);

  // Lock body scroll when scanning
  useEffect(() => {
    if (scanning) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [scanning]);

  const handleBarcodeSuccess = async (
    decodedText: string,
    scanner: Html5Qrcode
  ) => {
    try {
      // Stop scanning
      await scanner.stop();
      setScanning(false);
      scannerInitialized.current = false;

      // Process the barcode data
      if (drugDatabase[decodedText]) {
        setDrugInfo(drugDatabase[decodedText]);
        setScannerId(decodedText);
        setError(null);

        // Save to history in localStorage
        const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
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
    } catch (err) {
      console.error("Error processing barcode:", err);
      setError("Failed to process barcode. Please try again.");
    }
  };

  const handleStartScan = () => {
    setError(null);
    setDrugInfo(null);
    setScanning(true);
  };

  const handleStopScan = async () => {
    if (html5QrCode) {
      try {
        await html5QrCode.stop();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setScanning(false);
    scannerInitialized.current = false;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      {scanning ? (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="relative w-full h-full">
            {/* This is the element that will contain the scanner */}
            <div id="reader" className="absolute inset-0 w-full h-full"></div>

            {/* Centered viewfinder overlay - wider and shorter for barcodes */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="border-2 border-white rounded-lg w-[80vw] h-[100px] max-w-[400px]"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(255, 255, 255, 0)",
                    "0 0 0 10px rgba(255, 255, 255, 0.2)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />
            </div>

            {/* Header with back button */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white rounded-full bg-black/50"
                onClick={handleStopScan}
              >
                <X className="w-6 h-6" />
              </Button>

              <div className="px-4 py-2 text-sm font-medium text-white rounded-full bg-black/50">
                Scan Barcode
              </div>
            </div>

            {/* Instructions at the bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
              <p className="p-2 mb-4 text-sm text-white rounded-lg bg-black/50">
                Position the barcode within the frame to scan
              </p>
              <Button
                variant="destructive"
                onClick={handleStopScan}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Scan
              </Button>
            </div>
          </div>
        </div>
      ) : (
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
                <CardTitle>Barcode Scanner</CardTitle>
                <CardDescription>
                  Scan a medication barcode to view detailed information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  {drugInfo ? (
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
                        <h3 className="text-lg font-semibold text-primary">
                          {drugInfo.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ID: {drugInfo.id}
                        </p>
                      </motion.div>

                      {/* Expiry Alert */}
                      {isExpired && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.15 }}
                        >
                          <Alert
                            variant="destructive"
                            className="border-red-500 bg-red-50"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            <AlertTitle>Expired Medication</AlertTitle>
                            <AlertDescription>
                              This medication has expired and should not be
                              used. Please consult your healthcare provider.
                            </AlertDescription>
                          </Alert>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 rounded-lg bg-gray-50"
                      >
                        <h4 className="font-medium text-gray-700">
                          Description
                        </h4>
                        <p className="mt-1 text-sm">{drugInfo.description}</p>
                      </motion.div>

                      {/* Manufacture and Expiry Dates */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className={`p-4 rounded-lg ${
                          isExpired
                            ? "bg-red-50 border border-red-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <h4 className="flex items-center font-medium text-gray-700">
                          <Calendar className="w-4 h-4 mr-2" />
                          Dates
                        </h4>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="text-xs text-gray-500">
                              Manufactured
                            </p>
                            <p className="text-sm font-medium">
                              {formatDate(drugInfo.manufactureDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Expires</p>
                            <p
                              className={`text-sm font-medium ${
                                isExpired ? "text-red-600" : ""
                              }`}
                            >
                              {formatDate(drugInfo.expiryDate)}
                              {isExpired && " (EXPIRED)"}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 rounded-lg bg-gray-50"
                      >
                        <h4 className="font-medium text-gray-700">Dosage</h4>
                        <p className="mt-1 text-sm">{drugInfo.dosage}</p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="p-4 rounded-lg bg-gray-50"
                      >
                        <h4 className="font-medium text-gray-700">
                          Side Effects
                        </h4>
                        <ul className="mt-1 text-sm list-disc list-inside">
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
                      className="py-8 text-center"
                    >
                      {error ? (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 mb-4 text-red-500 rounded-lg bg-red-50"
                        >
                          {error}
                        </motion.div>
                      ) : (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="mb-4 text-gray-500"
                        >
                          No barcode scanned yet
                        </motion.p>
                      )}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        }}
                      >
                        <Button
                          onClick={handleStartScan}
                          className="mx-auto bg-primary hover:bg-primary/90"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Start Scanning
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
              {drugInfo && (
                <CardFooter className="border-t bg-gray-50">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <Button onClick={handleStartScan} className="w-full">
                      Scan Another Barcode
                    </Button>
                  </motion.div>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        </div>
      )}
    </>
  );
}
