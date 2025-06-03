import { PriceInfo } from "@/lib/types";
import { Badge } from "./badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { motion } from "framer-motion";

interface PriceComparisonProps {
  prices: PriceInfo[];
  className?: string;
}

export function PriceComparison({ prices, className = "" }: PriceComparisonProps) {
  // Sort prices from lowest to highest
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
  
  // Find the lowest and highest prices for comparison
  const lowestPrice = sortedPrices[0];
  const highestPrice = sortedPrices[sortedPrices.length - 1];
  
  // Calculate potential savings
  const potentialSavings = highestPrice.price - lowestPrice.price;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Price Comparison</CardTitle>
        <CardDescription>
          Compare prices across different pharmacies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {potentialSavings > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 text-sm rounded-lg bg-primary/10"
            >
              Potential savings up to ${potentialSavings.toFixed(2)}
            </motion.div>
          )}

          <div className="space-y-3">
            {sortedPrices.map((price, index) => (
              <motion.div
                key={`${price.pharmacy}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div className="space-y-1">
                  <p className="font-medium">{price.pharmacy}</p>
                  {price.location && (
                    <p className="text-sm text-gray-500">{price.location}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold">
                    ${price.price.toFixed(2)}
                  </span>
                  {price === lowestPrice && prices.length > 1 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Best Price
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-gray-500 italic">
            Last updated: {new Date(sortedPrices[0].lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
