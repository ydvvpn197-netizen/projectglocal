import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Extremely lightweight placeholder to satisfy various usages in the app
// Accepts any props and renders a simple dialog when `open` is provided
const FollowListsDialog = (props: Record<string, unknown>) => {
  const { open = false, onOpenChange = () => {}, type = 'followers' } = props || {};
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'followers' ? 'Followers' : 'Following'}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Lists coming soon…</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowListsDialog;
