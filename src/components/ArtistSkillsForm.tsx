import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, DollarSign, Palette } from "lucide-react";

interface ArtistSkillsFormProps {
  onSubmit: (data: ArtistSkillsData) => void;
  loading?: boolean;
  initialData?: ArtistSkillsData | null;
}

export interface ArtistSkillsData {
  artistSkills: string[];
  hourlyRateMin: number;
  hourlyRateMax: number;
  portfolioUrls: string[];
  bio: string;
  specialty: string;
}

const SKILL_CATEGORIES = {
  music: ["Vocals", "Guitar", "Piano", "Drums", "DJ", "Live Band", "Solo Performance"],
  visual: ["Photography", "Videography", "Painting", "Digital Art", "Portrait Art", "Wedding Photography"],
  performance: ["Dancing", "Acting", "Comedy", "Magic", "Acrobatics", "Theater"],
  event: ["Event Planning", "MC/Host", "Wedding Planning", "Corporate Events", "Birthday Parties"],
  craft: ["Crafts", "Jewelry Making", "Pottery", "Woodworking", "Textile Art", "Sculpture"]
};

export const ArtistSkillsForm: React.FC<ArtistSkillsFormProps> = ({ onSubmit, loading, initialData }) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialData?.artistSkills || []);
  const [customSkill, setCustomSkill] = useState("");
  const [hourlyRateMin, setHourlyRateMin] = useState(initialData?.hourlyRateMin?.toString() || "");
  const [hourlyRateMax, setHourlyRateMax] = useState(initialData?.hourlyRateMax?.toString() || "");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(initialData?.portfolioUrls || []);
  const [bio, setBio] = useState(initialData?.bio || "");
  const [specialty, setSpecialty] = useState(initialData?.specialty || "");

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill) && selectedSkills.length < 10) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const addPortfolioUrl = () => {
    if (portfolioUrl.trim() && !portfolioUrls.includes(portfolioUrl.trim())) {
      setPortfolioUrls([...portfolioUrls, portfolioUrl.trim()]);
      setPortfolioUrl("");
    }
  };

  const removePortfolioUrl = (url: string) => {
    setPortfolioUrls(portfolioUrls.filter(u => u !== url));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSkills.length === 0) {
      return;
    }

    onSubmit({
      artistSkills: selectedSkills,
      hourlyRateMin: parseFloat(hourlyRateMin) || 0,
      hourlyRateMax: parseFloat(hourlyRateMax) || 0,
      portfolioUrls,
      bio,
      specialty
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Artist Profile Setup
          </CardTitle>
          <CardDescription>
            Tell potential clients about your skills and services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Specialty */}
          <div className="space-y-2">
            <Label htmlFor="specialty">Primary Specialty</Label>
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Select your main specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="musician">Musician</SelectItem>
                <SelectItem value="photographer">Photographer</SelectItem>
                <SelectItem value="performer">Performer</SelectItem>
                <SelectItem value="visual_artist">Visual Artist</SelectItem>
                <SelectItem value="event_planner">Event Planner</SelectItem>
                <SelectItem value="crafter">Crafter</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell clients about yourself, your experience, and what makes you unique..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>

          {/* Skills Selection */}
          <div className="space-y-4">
            <div>
              <Label>Skills & Services</Label>
              <p className="text-sm text-muted-foreground">Select up to 10 skills that best describe your services</p>
            </div>
            
            <div className="grid gap-4">
              {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium capitalize">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Button
                        key={skill}
                        type="button"
                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                        size="sm"
                        onClick={() => selectedSkills.includes(skill) ? removeSkill(skill) : addSkill(skill)}
                        disabled={!selectedSkills.includes(skill) && selectedSkills.length >= 10}
                      >
                        {skill}
                        {selectedSkills.includes(skill) && <X className="ml-1 h-3 w-3" />}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Skill Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom skill..."
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
              />
              <Button type="button" onClick={addCustomSkill} disabled={selectedSkills.length >= 10}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected Skills */}
            {selectedSkills.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Skills ({selectedSkills.length}/10)</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hourly Rate */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Hourly Rate Range (Optional)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="number"
                  placeholder="Min rate"
                  value={hourlyRateMin}
                  onChange={(e) => setHourlyRateMin(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max rate"
                  value={hourlyRateMax}
                  onChange={(e) => setHourlyRateMax(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty if you prefer to negotiate rates per project
            </p>
          </div>

          {/* Portfolio URLs */}
          <div className="space-y-4">
            <Label>Portfolio Links (Optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add portfolio URL..."
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPortfolioUrl())}
              />
              <Button type="button" onClick={addPortfolioUrl}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {portfolioUrls.length > 0 && (
              <div className="space-y-2">
                {portfolioUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <span className="flex-1 text-sm truncate">{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePortfolioUrl(url)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading || selectedSkills.length === 0}>
            {loading ? "Saving..." : "Complete Artist Profile"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};
