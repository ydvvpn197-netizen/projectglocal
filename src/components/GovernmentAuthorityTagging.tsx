import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  Search, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  X,
  Shield,
  Megaphone,
  Users,
  Calendar
} from 'lucide-react';

interface GovernmentAuthority {
  id: string;
  name: string;
  department: string;
  level: 'local' | 'state' | 'national';
  contact_email: string;
  contact_phone?: string;
  jurisdiction: string;
  is_active: boolean;
}

interface GovernmentAuthorityTaggingProps {
  eventId?: string;
  selectedAuthorities: string[];
  onAuthoritiesChange: (authorityIds: string[]) => void;
  compact?: boolean;
  showContactInfo?: boolean;
}

export const GovernmentAuthorityTagging: React.FC<GovernmentAuthorityTaggingProps> = ({
  eventId,
  selectedAuthorities,
  onAuthoritiesChange,
  compact = false,
  showContactInfo = true
}) => {
  const { toast } = useToast();
  const [authorities, setAuthorities] = useState<GovernmentAuthority[]>([]);
  const [filteredAuthorities, setFilteredAuthorities] = useState<GovernmentAuthority[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'local' | 'state' | 'national'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Load government authorities
  useEffect(() => {
    loadAuthorities();
  }, [loadAuthorities]);

  // Filter authorities based on search and level
  useEffect(() => {
    let filtered = authorities;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(authority =>
        authority.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        authority.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        authority.jurisdiction.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by level
    if (levelFilter !== 'all') {
      filtered = filtered.filter(authority => authority.level === levelFilter);
    }

    setFilteredAuthorities(filtered);
  }, [authorities, searchQuery, levelFilter]);

  const loadAuthorities = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('government_authorities')
        .select('*')
        .eq('is_active', true)
        .order('level', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setAuthorities(data || []);
    } catch (error) {
      console.error('Error loading government authorities:', error);
      toast({
        title: "Error",
        description: "Failed to load government authorities.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleAuthorityToggle = (authorityId: string) => {
    const newSelection = selectedAuthorities.includes(authorityId)
      ? selectedAuthorities.filter(id => id !== authorityId)
      : [...selectedAuthorities, authorityId];
    
    onAuthoritiesChange(newSelection);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'local': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'state': return 'bg-green-100 text-green-800 border-green-200';
      case 'national': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'local': return <MapPin className="h-4 w-4" />;
      case 'state': return <Building2 className="h-4 w-4" />;
      case 'national': return <Shield className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  const getSelectedAuthorities = () => {
    return authorities.filter(authority => selectedAuthorities.includes(authority.id));
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Tag Government Authorities</Label>
          <Badge variant="secondary">
            {selectedAuthorities.length} selected
          </Badge>
        </div>

        {selectedAuthorities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {getSelectedAuthorities().map((authority) => (
              <Badge
                key={authority.id}
                className={`${getLevelColor(authority.level)} flex items-center gap-1`}
              >
                {getLevelIcon(authority.level)}
                {authority.name}
                <button
                  onClick={() => handleAuthorityToggle(authority.id)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Input
            placeholder="Search authorities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm"
          />
          
          <Select value={levelFilter} onValueChange={(value: 'all' | 'local' | 'state' | 'national') => setLevelFilter(value)}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="state">State</SelectItem>
              <SelectItem value="national">National</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="max-h-40 overflow-y-auto space-y-1">
          {filteredAuthorities.map((authority) => (
            <div
              key={authority.id}
              className={`p-2 border rounded cursor-pointer transition-all text-sm ${
                selectedAuthorities.includes(authority.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleAuthorityToggle(authority.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getLevelIcon(authority.level)}
                  <span className="font-medium">{authority.name}</span>
                </div>
                {selectedAuthorities.includes(authority.id) && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {authority.department} • {authority.jurisdiction}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Government Authority Tagging
        </CardTitle>
        <CardDescription>
          Tag relevant government authorities for civic events, protests, or community issues
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="search" className="text-sm font-medium">Search Authorities</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, department, or jurisdiction..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="level-filter" className="text-sm font-medium">Filter by Level</Label>
            <Select value={levelFilter} onValueChange={(value: 'all' | 'local' | 'state' | 'national') => setLevelFilter(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="local">Local Government</SelectItem>
                <SelectItem value="state">State Government</SelectItem>
                <SelectItem value="national">National Government</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected Authorities */}
        {selectedAuthorities.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Selected Authorities ({selectedAuthorities.length})</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAuthoritiesChange([])}
              >
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getSelectedAuthorities().map((authority) => (
                <div
                  key={authority.id}
                  className={`p-3 border rounded-lg ${getLevelColor(authority.level)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getLevelIcon(authority.level)}
                        <span className="font-medium">{authority.name}</span>
                      </div>
                      <p className="text-sm opacity-80">{authority.department}</p>
                      <p className="text-xs opacity-70">{authority.jurisdiction}</p>
                    </div>
                    <button
                      onClick={() => handleAuthorityToggle(authority.id)}
                      className="ml-2 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Authorities List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              Available Authorities ({filteredAuthorities.length})
            </h4>
            {isLoading && (
              <div className="text-sm text-muted-foreground">Loading...</div>
            )}
          </div>

          {filteredAuthorities.length === 0 && !isLoading && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No authorities found matching your criteria.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredAuthorities.map((authority) => (
              <div
                key={authority.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedAuthorities.includes(authority.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleAuthorityToggle(authority.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getLevelIcon(authority.level)}
                      <h5 className="font-medium">{authority.name}</h5>
                      <Badge className={getLevelColor(authority.level)}>
                        {authority.level}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {authority.department}
                    </p>
                    
                    <p className="text-xs text-muted-foreground mb-3">
                      Jurisdiction: {authority.jurisdiction}
                    </p>

                    {showContactInfo && (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{authority.contact_email}</span>
                        </div>
                        {authority.contact_phone && (
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{authority.contact_phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {selectedAuthorities.includes(authority.id) && (
                    <CheckCircle className="h-5 w-5 text-primary ml-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Guidelines */}
        <Alert className="bg-blue-50 border-blue-200">
          <Megaphone className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">When to tag government authorities:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Civic events and town halls</li>
                <li>• Protests and demonstrations</li>
                <li>• Community issues requiring government attention</li>
                <li>• Public policy discussions</li>
                <li>• Environmental or safety concerns</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
