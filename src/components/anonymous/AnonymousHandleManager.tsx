import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, 
  RefreshCw, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Sparkles,
  Shield,
  AlertTriangle,
  Info,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { anonymousHandleService, AnonymousHandle } from '@/services/anonymousHandleService';

interface AnonymousHandleManagerProps {
  className?: string;
  onHandleChange?: (handle: AnonymousHandle) => void;
}

export const AnonymousHandleManager: React.FC<AnonymousHandleManagerProps> = ({
  className,
  onHandleChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentHandle, setCurrentHandle] = useState<AnonymousHandle | null>(null);
  const [suggestions, setSuggestions] = useState<AnonymousHandle[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customHandle, setCustomHandle] = useState('');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
  } | null>(null);

  // Load current handle on component mount
  useEffect(() => {
    if (user) {
      loadCurrentHandle();
    }
  }, [user, loadCurrentHandle]);

  const loadCurrentHandle = useCallback(async () => {
    if (!user) return;

    try {
      // This would typically come from the user profile
      // For now, we'll simulate loading the current handle
      setCurrentHandle({
        username: 'AnonymousUser_' + Math.random().toString(36).substr(2, 8),
        displayName: 'Anonymous User',
        isGenerated: true,
        isUnique: true
      });
    } catch (error) {
      console.error('Error loading current handle:', error);
      toast({
        title: "Error",
        description: "Failed to load current handle",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const generateSuggestions = useCallback(async () => {
    setIsGenerating(true);
    try {
      const newSuggestions = await anonymousHandleService.generateHandleSuggestions(6, {
        format: 'random',
        includeNumbers: true,
        maxLength: 20
      });
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate handle suggestions",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const validateCustomHandle = useCallback(async () => {
    if (!customHandle.trim()) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);
    try {
      const validation = anonymousHandleService.validateHandle(customHandle);
      
      if (validation.isValid) {
        const isUnique = await anonymousHandleService.isHandleUnique(customHandle);
        validation.isValid = isUnique;
        if (!isUnique) {
          validation.errors.push('This username is already taken');
        }
      }

      setValidationResult(validation);
    } catch (error) {
      console.error('Error validating handle:', error);
      setValidationResult({
        isValid: false,
        errors: ['Validation failed']
      });
    } finally {
      setIsValidating(false);
    }
  }, [customHandle]);

  const applyHandle = useCallback(async (handle: AnonymousHandle) => {
    if (!user) return;

    try {
      const result = await anonymousHandleService.regenerateAnonymousHandle(user.id, {
        format: 'random',
        includeNumbers: true,
        maxLength: 20
      });

      if (result.success && result.handle) {
        setCurrentHandle(result.handle);
        onHandleChange?.(result.handle);
        toast({
          title: "Handle Updated",
          description: `Your anonymous handle is now: ${result.handle.username}`
        });
      } else {
        throw new Error(result.error || 'Failed to update handle');
      }
    } catch (error) {
      console.error('Error applying handle:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update your handle",
        variant: "destructive"
      });
    }
  }, [user, onHandleChange, toast]);

  const copyHandleToClipboard = useCallback(async (handle: string) => {
    try {
      await navigator.clipboard.writeText(handle);
      toast({
        title: "Copied!",
        description: "Handle copied to clipboard"
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy handle to clipboard",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(() => {
      validateCustomHandle();
    }, 500);

    return () => clearTimeout(timer);
  }, [customHandle, validateCustomHandle]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Handle Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Your Anonymous Handle
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentHandle ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{currentHandle.displayName}</h3>
                    <p className="text-gray-600">@{currentHandle.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Anonymous
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyHandleToClipboard(currentHandle.username)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={generateSuggestions}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generate New Handle
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <User className="h-4 w-4 mr-2" />
                      Custom Handle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set Custom Handle</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="customHandle">Username</Label>
                        <div className="flex gap-2">
                          <Input
                            id="customHandle"
                            value={customHandle}
                            onChange={(e) => setCustomHandle(e.target.value)}
                            placeholder="Enter your desired username"
                          />
                          {isValidating && (
                            <RefreshCw className="h-4 w-4 animate-spin self-center" />
                          )}
                        </div>
                        
                        {validationResult && (
                          <div className="mt-2">
                            {validationResult.isValid ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <Check className="h-4 w-4" />
                                <span className="text-sm">Username is available!</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {validationResult.errors.map((error, index) => (
                                  <div key={index} className="flex items-center gap-2 text-red-600">
                                    <X className="h-4 w-4" />
                                    <span className="text-sm">{error}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            if (validationResult?.isValid) {
                              applyHandle({
                                username: customHandle,
                                displayName: customHandle,
                                isGenerated: false,
                                isUnique: true
                              });
                            }
                          }}
                          disabled={!validationResult?.isValid}
                          className="flex-1"
                        >
                          Apply Custom Handle
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCustomHandle('');
                            setValidationResult(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Loading your handle...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Handle Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Handle Suggestions
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuggestions(false)}
                    className="ml-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion.username}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {suggestion.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">@{suggestion.username}</p>
                          <p className="text-sm text-gray-600">
                            {suggestion.isGenerated ? 'Generated' : 'Custom'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyHandleToClipboard(suggestion.username)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => applyHandle(suggestion)}
                        >
                          Use This
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={generateSuggestions}
                    disabled={isGenerating}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    Generate More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            About Anonymous Handles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 mt-0.5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Privacy Protection</p>
                <p>Your anonymous handle protects your real identity while allowing community participation.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <RefreshCw className="h-4 w-4 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Regeneratable</p>
                <p>You can change your handle anytime to maintain anonymity or refresh your identity.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <EyeOff className="h-4 w-4 mt-0.5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">No Personal Info</p>
                <p>Handles are randomly generated and contain no personal information about you.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
