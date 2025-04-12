/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Mock database of drug information (same as in scanner page)
const drugDatabase = {
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
    description: "Antibiotic used to treat a variety of bacterial infections.",
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
} as const;

type DrugId = keyof typeof drugDatabase;

export default function GeneratePage() {
  const [selectedDrug, setSelectedDrug] = useState<DrugId>("MED001");
  const [barcodeWidth, setBarcodeWidth] = useState(300);
  const [barcodeHeight, setBarcodeHeight] = useState(80);
  const [barcodeFormat, setBarcodeFormat] = useState("CODE128");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate barcode when component mounts or dependencies change
  useEffect(() => {
    const generateBarcode = async () => {
      if (!canvasRef.current) return;

      try {
        // Dynamically import JsBarcode to avoid SSR issues
        const JsBarcode = (await import("jsbarcode")).default;

        // Clear previous barcode
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }

        // Generate new barcode
        JsBarcode(canvasRef.current, selectedDrug, {
          format: barcodeFormat,
          width: 2,
          height: barcodeHeight,
          displayValue: true,
          fontSize: 16,
          margin: 10,
          background: "#ffffff",
          lineColor: "#000000",
        });
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    };

    generateBarcode();
  }, [selectedDrug, barcodeHeight, barcodeFormat]);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedDrug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    // Create a download link for the canvas
    const link = document.createElement("a");
    link.download = `${selectedDrug}-Barcode.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
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
            <CardTitle>Barcode Generator</CardTitle>
            <CardDescription>
              Generate barcodes for testing the medication scanner
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Medication</Label>
                <Select
                  value={selectedDrug}
                  onValueChange={(value: string) =>
                    setSelectedDrug(value as DrugId)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a medication" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(drugDatabase).map(([id, drug]) => (
                      <SelectItem key={id} value={id}>
                        {drug.name} ({id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue="barcode" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="barcode">Barcode</TabsTrigger>
                  <TabsTrigger value="details">Medication Details</TabsTrigger>
                </TabsList>
                <TabsContent value="barcode" className="mt-4">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="p-4 bg-white rounded-lg shadow-sm border w-full overflow-hidden">
                      <canvas ref={canvasRef} className="w-full" />
                    </div>

                    <div className="space-y-4 w-full">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-sm font-medium">
                            Barcode Height
                          </Label>
                          <span className="text-xs text-gray-500">
                            {barcodeHeight}px
                          </span>
                        </div>
                        <Slider
                          value={[barcodeHeight]}
                          min={40}
                          max={120}
                          step={10}
                          onValueChange={(value) => setBarcodeHeight(value[0])}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Barcode Format
                        </Label>
                        <RadioGroup
                          value={barcodeFormat}
                          onValueChange={setBarcodeFormat}
                          className="grid grid-cols-2 gap-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="CODE128" id="code128" />
                            <Label htmlFor="code128" className="text-sm">
                              CODE128
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="CODE39" id="code39" />
                            <Label htmlFor="code39" className="text-sm">
                              CODE39
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="EAN13" id="ean13" />
                            <Label htmlFor="ean13" className="text-sm">
                              EAN-13
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="UPC" id="upc" />
                            <Label htmlFor="upc" className="text-sm">
                              UPC
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="flex items-center space-x-2 w-full">
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={handleCopy}
                        >
                          {copied ? "Copied!" : "Copy Code"}
                          <Copy className="ml-2 h-4 w-4" />
                        </Button>
                        <Button className="flex-1" onClick={handleDownload}>
                          Download
                          <Download className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="details" className="mt-4">
                  <div className="space-y-4">
                    {selectedDrug && drugDatabase[selectedDrug] && (
                      <>
                        <div>
                          <h3 className="font-semibold text-lg text-primary">
                            {drugDatabase[selectedDrug].name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ID: {drugDatabase[selectedDrug].id}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-700">
                            Description
                          </h4>
                          <p className="text-sm mt-1">
                            {drugDatabase[selectedDrug].description}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-700">Dosage</h4>
                          <p className="text-sm mt-1">
                            {drugDatabase[selectedDrug].dosage}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t">
            <Link href="/scanner" className="w-full">
              <Button className="w-full">Go to Scanner</Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
