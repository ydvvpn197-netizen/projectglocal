import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Extremely lightweight placeholder to satisfy various usages in the app
// Accepts any props and renders a simple dialog when `open` is provided
export default function FollowListsDialog(props: any) {
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
}

// Also export a named version for imports using named export
export { FollowListsDialog as NamedFollowListsDialog };

function FollowListsDialog({ open, onOpenChange, type }: { open?: boolean; onOpenChange?: (o: boolean) => void; type?: 'followers' | 'following' }) {
  return (
    <Dialog open={!!open} onOpenChange={onOpenChange || (() => {})}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'following' ? 'Following' : 'Followers'}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Lists coming soon…</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
