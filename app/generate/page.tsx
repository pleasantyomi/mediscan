"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Copy, Calendar } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { drugDatabase } from "@/lib/data";


type DrugId = keyof typeof drugDatabase;

export default function GeneratePage() {
  const [selectedDrug, setSelectedDrug] = useState<DrugId>("MED001");
  const [barcodeHeight, setBarcodeHeight] = useState(80);
  const [barcodeFormat, setBarcodeFormat] = useState("CODE128");
  const [manufactureDate, setManufactureDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Set initial dates when drug selection changes
  useEffect(() => {
    if (drugDatabase[selectedDrug]) {
      setManufactureDate(drugDatabase[selectedDrug].manufactureDate);
      setExpiryDate(drugDatabase[selectedDrug].expiryDate);
    }
  }, [selectedDrug]);

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

  // Check if drug is expired
  const isExpired = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return today > expiry;
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
                    <div className="w-full p-4 overflow-hidden bg-white border rounded-lg shadow-sm">
                      <canvas ref={canvasRef} className="w-full" />
                    </div>

                    <div className="w-full space-y-4">
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

                      {/* Date fields */}
                      <div className="pt-3 space-y-3 border-t">
                        <Label className="flex items-center text-sm font-medium">
                          <Calendar className="w-4 h-4 mr-2" />
                          Medication Dates
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label
                              htmlFor="manufactureDate"
                              className="text-xs"
                            >
                              Manufacture Date
                            </Label>
                            <Input
                              id="manufactureDate"
                              type="date"
                              value={manufactureDate}
                              onChange={(e) =>
                                setManufactureDate(e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="expiryDate" className="text-xs">
                              Expiry Date
                            </Label>
                            <Input
                              id="expiryDate"
                              type="date"
                              value={expiryDate}
                              onChange={(e) => setExpiryDate(e.target.value)}
                              className={
                                isExpired(expiryDate)
                                  ? "border-red-300 focus:ring-red-500"
                                  : ""
                              }
                            />
                            {isExpired(expiryDate) && (
                              <p className="mt-1 text-xs text-red-500">
                                This medication is expired
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center w-full space-x-2">
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={handleCopy}
                        >
                          {copied ? "Copied!" : "Copy Code"}
                          <Copy className="w-4 h-4 ml-2" />
                        </Button>
                        <Button className="flex-1" onClick={handleDownload}>
                          Download
                          <Download className="w-4 h-4 ml-2" />
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
                          <h3 className="text-lg font-semibold text-primary">
                            {drugDatabase[selectedDrug].name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ID: {drugDatabase[selectedDrug].id}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50">
                          <h4 className="font-medium text-gray-700">
                            Description
                          </h4>
                          <p className="mt-1 text-sm">
                            {drugDatabase[selectedDrug].description}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50">
                          <h4 className="font-medium text-gray-700">Dosage</h4>
                          <p className="mt-1 text-sm">
                            {drugDatabase[selectedDrug].dosage}
                          </p>
                        </div>
                        <div
                          className={`p-4 rounded-lg ${
                            isExpired(expiryDate)
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
                                {formatDate(manufactureDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Expires</p>
                              <p
                                className={`text-sm font-medium ${
                                  isExpired(expiryDate) ? "text-red-600" : ""
                                }`}
                              >
                                {formatDate(expiryDate)}
                                {isExpired(expiryDate) && " (EXPIRED)"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-gray-50">
            <Link href="/scanner" className="w-full">
              <Button className="w-full">Go to Scanner</Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
