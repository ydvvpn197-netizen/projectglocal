import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X, Trash2 } from 'lucide-react';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import { useAuth } from '@/hooks/useAuth';

interface ProfilePhotoDialogProps {
  currentAvatarUrl?: string;
  displayName?: string;
  onPhotoUpdated?: (newUrl: string | null) => void;
  trigger?: React.ReactNode;
}

export const ProfilePhotoDialog = ({ 
  currentAvatarUrl, 
  displayName, 
  onPhotoUpdated,
  trigger 
}: ProfilePhotoDialogProps) => {
  const { user } = useAuth();
  const { uploadProfilePhoto, removeProfilePhoto, uploading } = useProfilePhoto();
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const newUrl = await uploadProfilePhoto(selectedFile);
    if (newUrl) {
      onPhotoUpdated?.(newUrl);
      setOpen(false);
      resetState();
    }
  };

  const handleRemove = async () => {
    const success = await removeProfilePhoto();
    if (success) {
      onPhotoUpdated?.(null);
      setOpen(false);
      resetState();
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetState();
    }
  };

  const displayAvatarUrl = previewUrl || currentAvatarUrl;
  const displayNameInitial = displayName?.charAt(0) || user?.email?.charAt(0) || "U";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-2" />
            Change Photo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Photo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current/Preview Avatar */}
          <div className="flex justify-center">
            <Avatar className="w-24 h-24">
              <AvatarImage src={displayAvatarUrl} />
              <AvatarFallback className="text-2xl">
                {displayNameInitial}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Upload Section */}
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="profile-photo-upload"
              />
              <label htmlFor="profile-photo-upload">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Photo
                  </span>
                </Button>
              </label>
              
              {selectedFile && (
                <div className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-center">
              {selectedFile && (
                <>
                  <Button 
                    onClick={handleUpload} 
                    disabled={uploading}
                    className="flex-1"
                  >
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Remove Photo Option */}
            {currentAvatarUrl && !selectedFile && (
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleRemove}
                  disabled={uploading}
                  className="w-full text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Current Photo
                </Button>
              </div>
            )}
          </div>

          {/* File Requirements */}
          <div className="text-xs text-muted-foreground text-center">
            <p>Supported formats: JPEG, PNG, WebP, GIF</p>
            <p>Maximum file size: 5MB</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
