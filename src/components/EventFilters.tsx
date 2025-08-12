import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Clock, MapPin, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";

export interface EventFilters {
  eventTypes: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
  timeRange: {
    startTime: string;
    endTime: string;
  };
  proximity: number;
  area: string;
  priceRange: {
    min: number;
    max: number;
  };
  freeOnly: boolean;
}

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  onClearFilters: () => void;
}

const eventCategories = [
  "Art", "Music", "Food", "Sports", "Technology", "Business", "Health", 
  "Education", "Entertainment", "Community", "Networking", "Workshop"
];

const timeSlots = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
];

export const EventFiltersComponent = ({ filters, onFiltersChange, onClearFilters }: EventFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilters = (key: keyof EventFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleEventType = (type: string) => {
    const newTypes = filters.eventTypes.includes(type)
      ? filters.eventTypes.filter(t => t !== type)
      : [...filters.eventTypes, type];
    updateFilters('eventTypes', newTypes);
  };

  const hasActiveFilters = 
    filters.eventTypes.length > 0 ||
    filters.dateRange.from ||
    filters.dateRange.to ||
    filters.timeRange.startTime !== "00:00" ||
    filters.timeRange.endTime !== "23:59" ||
    filters.proximity < 50 ||
    filters.area !== "" ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < 500 ||
    filters.freeOnly;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 relative">
          <Filter className="h-4 w-4" />
          Filter
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs">
              !
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-none">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClearFilters}
                    className="h-8 px-2 text-muted-foreground"
                  >
                    Clear all
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Event Types */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Event Types
              </Label>
              <div className="flex flex-wrap gap-2">
                {eventCategories.map((category) => (
                  <Badge
                    key={category}
                    variant={filters.eventTypes.includes(category) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => toggleEventType(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Date Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Date Range
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateRange.from && "text-muted-foreground"
                      )}
                    >
                      {filters.dateRange.from ? format(filters.dateRange.from, "PP") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from}
                      onSelect={(date) => 
                        updateFilters('dateRange', { ...filters.dateRange, from: date })
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateRange.to && "text-muted-foreground"
                      )}
                    >
                      {filters.dateRange.to ? format(filters.dateRange.to, "PP") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to}
                      onSelect={(date) => 
                        updateFilters('dateRange', { ...filters.dateRange, to: date })
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Time Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Range
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Select 
                  value={filters.timeRange.startTime} 
                  onValueChange={(value) => 
                    updateFilters('timeRange', { ...filters.timeRange, startTime: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={filters.timeRange.endTime} 
                  onValueChange={(value) => 
                    updateFilters('timeRange', { ...filters.timeRange, endTime: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="End time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Location Proximity */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Distance: {filters.proximity} km
              </Label>
              <Slider
                value={[filters.proximity]}
                onValueChange={(value) => updateFilters('proximity', value[0])}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 km</span>
                <span>100 km</span>
              </div>
            </div>

            {/* Area */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Specific Area</Label>
              <Input
                placeholder="Enter neighborhood, city, or venue..."
                value={filters.area}
                onChange={(e) => updateFilters('area', e.target.value)}
              />
            </div>

            <Separator />

            {/* Price Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Price Range: ${filters.priceRange.min} - ${filters.priceRange.max}
              </Label>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Min</Label>
                    <Slider
                      value={[filters.priceRange.min]}
                      onValueChange={(value) => 
                        updateFilters('priceRange', { ...filters.priceRange, min: value[0] })
                      }
                      min={0}
                      max={500}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Max</Label>
                    <Slider
                      value={[filters.priceRange.max]}
                      onValueChange={(value) => 
                        updateFilters('priceRange', { ...filters.priceRange, max: value[0] })
                      }
                      min={0}
                      max={500}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="free-only"
                    checked={filters.freeOnly}
                    onCheckedChange={(checked) => updateFilters('freeOnly', checked)}
                  />
                  <Label htmlFor="free-only" className="text-sm">Free events only</Label>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <Button 
              className="w-full" 
              onClick={() => setIsOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  );
};