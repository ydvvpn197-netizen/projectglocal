import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { MapPin, Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DistanceFilterProps {
  onDistanceChange: (distance: number) => void;
  currentDistance: number;
}

export function DistanceFilter({ onDistanceChange, currentDistance }: DistanceFilterProps) {
  const [tempDistance, setTempDistance] = useState(currentDistance);
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    onDistanceChange(tempDistance);
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempDistance(50);
    onDistanceChange(50);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MapPin className="h-4 w-4" />
          {currentDistance < 50 ? `${currentDistance} miles` : 'All nearby'}
          <Filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Distance from you</label>
                <span className="text-sm text-muted-foreground">
                  {tempDistance < 50 ? `${tempDistance} miles` : 'All nearby (50+ miles)'}
                </span>
              </div>
              
              <div className="px-2">
                <Slider
                  value={[tempDistance]}
                  onValueChange={(value) => setTempDistance(value[0])}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 mile</span>
                <span>50+ miles</span>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 inline mr-1" />
              Posts and events within this radius will be shown in your feed
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleApply} className="flex-1">
                Apply Filter
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}