import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, X, BarChart3 } from "lucide-react";
import { usePolls } from "@/hooks/usePolls";

interface CreatePollDialogProps {
  children: React.ReactNode;
}

const expirationOptions = [
  { value: "1", label: "1 day" },
  { value: "3", label: "3 days" },
  { value: "7", label: "1 week" },
  { value: "14", label: "2 weeks" },
  { value: "30", label: "1 month" }
];

export function CreatePollDialog({ children }: CreatePollDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    options: [
      { id: "option1", text: "", votes: 0 },
      { id: "option2", text: "", votes: 0 }
    ],
    hasExpiration: false,
    expirationDays: "7"
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const { createPoll, creating } = usePolls();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.title.trim()) {
      newErrors.title = "Poll title is required";
    }

    if (formData.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters long";
    }

    // Validate options
    const validOptions = formData.options.filter(option => option.text.trim().length > 0);
    if (validOptions.length < 2) {
      newErrors.options = "At least 2 options are required";
    }

    // Check for duplicate options
    const optionTexts = validOptions.map(option => option.text.trim().toLowerCase());
    const uniqueTexts = new Set(optionTexts);
    if (optionTexts.length !== uniqueTexts.size) {
      newErrors.options = "Options must be unique";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const validOptions = formData.options
      .filter(option => option.text.trim().length > 0)
      .map(option => ({
        id: option.id,
        text: option.text.trim(),
        votes: 0
      }));

    const expiresAt = formData.hasExpiration 
      ? new Date(Date.now() + parseInt(formData.expirationDays) * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const result = await createPoll({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      options: validOptions,
      expires_at: expiresAt
    });

    if (result.success) {
      setOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      options: [
        { id: "option1", text: "", votes: 0 },
        { id: "option2", text: "", votes: 0 }
      ],
      hasExpiration: false,
      expirationDays: "7"
    });
    setErrors({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const addOption = () => {
    if (formData.options.length >= 10) return; // Max 10 options
    
    const newId = `option${formData.options.length + 1}`;
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { id: newId, text: "", votes: 0 }]
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return; // Min 2 options
    
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, text } : option
      )
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Create Community Poll
          </DialogTitle>
          <DialogDescription>
            Create a poll to gather community opinions and feedback. Share it with others to get their votes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Poll Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Poll Title *</Label>
            <Input
              id="title"
              placeholder="What would you like to ask the community?"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Poll Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide more context about your poll question..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>

          {/* Poll Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Poll Options *</Label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formData.options.length}/10</span>
                {formData.options.length < 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="h-7 px-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="h-9 w-9 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {errors.options && (
              <p className="text-sm text-destructive">{errors.options}</p>
            )}

            <p className="text-sm text-muted-foreground">
              At least 2 options required. Maximum 10 options allowed.
            </p>
          </div>

          {/* Expiration Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Set Expiration Date</Label>
              <Switch
                checked={formData.hasExpiration}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasExpiration: checked }))}
              />
            </div>

            {formData.hasExpiration && (
              <div className="space-y-2">
                <Label>Expires After</Label>
                <Select
                  value={formData.expirationDays}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, expirationDays: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expirationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={creating}
            className="min-w-[100px]"
          >
            {creating ? "Creating..." : "Create Poll"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
