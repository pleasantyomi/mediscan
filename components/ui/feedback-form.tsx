import { useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { motion, AnimatePresence } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { FeedbackInfo } from "@/lib/types";

interface FeedbackFormProps {
  drugId: string;
  drugName: string;
  onSubmit: (feedback: Omit<FeedbackInfo, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}

export function FeedbackForm({ drugId, drugName, onSubmit, onCancel }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [pharmacy, setPharmacy] = useState("");
  const [price, setPrice] = useState<string>("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      drugId,
      rating,
      comment,
      ...(price && pharmacy ? {
        priceInfo: {
          pharmacy,
          price: parseFloat(price),
          location,
        }
      } : {})
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4"
    >
      <Card className="max-w-md mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Share Your Feedback</CardTitle>
            <CardDescription>
              Help others by sharing your experience with {drugName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>How would you rate this medication?</Label>
              <RadioGroup
                value={rating.toString()}
                onValueChange={(value) => setRating(parseInt(value))}
                className="flex justify-between"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center space-y-1">
                    <RadioGroupItem
                      value={value.toString()}
                      id={`rating-${value}`}
                      className="peer"
                    />
                    <Label
                      htmlFor={`rating-${value}`}
                      className="text-sm peer-data-[state=checked]:text-primary"
                    >
                      {value}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comments (optional)</Label>
              <Input
                id="comment"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="p-4 space-y-4 rounded-lg bg-primary/5">
              <h4 className="text-sm font-medium">Price Information (optional)</h4>
              <div className="space-y-2">
                <Label htmlFor="pharmacy">Pharmacy Name</Label>
                <Input
                  id="pharmacy"
                  placeholder="e.g. CVS, Walgreens"
                  value={pharmacy}
                  onChange={(e) => setPharmacy(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <Button type="submit" className="w-full">
              Submit Feedback
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
