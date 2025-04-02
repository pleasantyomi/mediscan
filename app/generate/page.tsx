"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
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
};

export default function GeneratePage() {
  const [selectedDrug, setSelectedDrug] = useState<
    "MED001" | "MED002" | "MED003"
  >("MED001");
  const [qrSize, setQrSize] = useState(200);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedDrug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = qrSize;
      canvas.height = qrSize;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      // Download the PNG file
      const downloadLink = document.createElement("a");
      downloadLink.download = `${selectedDrug}-QRCode.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
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
            <CardTitle>QR Code Generator</CardTitle>
            <CardDescription>
              Generate QR codes for testing the medication scanner
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Medication</label>
                <Select
                  value={selectedDrug}
                  onValueChange={(value: "MED001" | "MED002" | "MED003") =>
                    setSelectedDrug(value)
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

              <Tabs defaultValue="qrcode" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                  <TabsTrigger value="details">Medication Details</TabsTrigger>
                </TabsList>
                <TabsContent value="qrcode" className="mt-4">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-white rounded-lg shadow-sm border">
                      <QRCodeSVG
                        id="qr-code-svg"
                        value={selectedDrug}
                        size={qrSize}
                        level="H" // High error correction
                        includeMargin={true}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQrSize(Math.max(100, qrSize - 50))}
                        disabled={qrSize <= 100}
                      >
                        Smaller
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQrSize(Math.min(400, qrSize + 50))}
                        disabled={qrSize >= 400}
                      >
                        Larger
                      </Button>
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
