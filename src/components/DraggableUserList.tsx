/**
 * DraggableUserList Component
 * 
 * A user list component with drag and drop functionality for reordering users.
 * Uses the HTML5 Drag and Drop API for smooth interactions.
 * 
 * @component
 * @example
 * ```tsx
 * <DraggableUserList
 *   users={users}
 *   onReorder={handleReorder}
 *   variant="default"
 * />
 * ```
 */

import React, { useState, useCallback } from 'react';
import { EnhancedUserProfileCard, EnhancedUserProfile } from './EnhancedUserProfileCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, Users, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DraggableUserListProps {
  users: EnhancedUserProfile[];
  variant?: 'default' | 'compact' | 'minimal' | 'premium' | 'featured' | 'enterprise' | 'dark';
  onReorder?: (users: EnhancedUserProfile[]) => void;
  onUserAction?: (userId: string, action: string, data?: Record<string, unknown>) => void;
  onFollow?: (userId: string) => void | Promise<void>;
  onMessage?: (userId: string) => void | Promise<void>;
  onViewProfile?: (userId: string) => void | Promise<void>;
  onShare?: (userId: string) => void | Promise<void>;
  onEdit?: (userId: string) => void | Promise<void>;
  onContact?: (userId: string) => void | Promise<void>;
  className?: string;
  showDragHandles?: boolean;
  allowReordering?: boolean;
}

export default function DraggableUserList({
  users: initialUsers,
  variant = 'default',
  onReorder,
  onUserAction,
  onFollow,
  onMessage,
  onViewProfile,
  onShare,
  onEdit,
  onContact,
  className,
  showDragHandles = true,
  allowReordering = true
}: DraggableUserListProps) {
  const [users, setUsers] = useState<EnhancedUserProfile[]>(initialUsers);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    if (!allowReordering) return;
    
    setDraggedIndex(index);
    
    // Safety check for dataTransfer in test environment
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', index.toString());
    }
    
    // Add visual feedback
    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  }, [allowReordering]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    if (!allowReordering || draggedIndex === null) return;
    
    e.preventDefault();
    
    // Safety check for dataTransfer in test environment
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  }, [allowReordering, draggedIndex, dragOverIndex]);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    if (!allowReordering || draggedIndex === null) return;
    
    e.preventDefault();
    
    const newUsers = [...users];
    const [draggedUser] = newUsers.splice(draggedIndex, 1);
    newUsers.splice(dropIndex, 0, draggedUser);
    
    setUsers(newUsers);
    setDraggedIndex(null);
    setDragOverIndex(null);
    
    // Reset opacity
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    
    // Call callback
    onReorder?.(newUsers);
  }, [allowReordering, draggedIndex, users, onReorder]);

  // Handle drag end
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    
    // Reset opacity
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
  }, []);

  // Shuffle users randomly
  const handleShuffle = useCallback(() => {
    const shuffled = [...users].sort(() => Math.random() - 0.5);
    setUsers(shuffled);
    onReorder?.(shuffled);
  }, [users, onReorder]);

  // Reset to original order
  const handleReset = useCallback(() => {
    setUsers(initialUsers);
    onReorder?.(initialUsers);
  }, [initialUsers, onReorder]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            {users.length} users
          </span>
          {allowReordering && (
            <Badge variant="secondary" className="text-xs">
              Drag to reorder
            </Badge>
          )}
        </div>
        
        {allowReordering && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShuffle}
              className="text-xs"
            >
              <Shuffle className="h-3 w-3 mr-1" />
              Shuffle
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs"
            >
              Reset
            </Button>
          </div>
        )}
      </div>

      {/* User List */}
      <div className="space-y-3">
        {users.map((user, index) => (
          <Card
            key={user.id}
            className={cn(
              'transition-all duration-200 cursor-move',
              'hover:shadow-md hover:scale-[1.01]',
              draggedIndex === index && 'opacity-50 scale-95',
              dragOverIndex === index && 'ring-2 ring-primary/50 ring-offset-2',
              !allowReordering && 'cursor-default'
            )}
            {...(allowReordering ? { draggable: true } : {})}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            data-testid="user-card"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {/* Drag Handle */}
                {showDragHandles && allowReordering && (
                  <div 
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="drag-handle"
                  >
                    <GripVertical className="h-5 w-5" />
                  </div>
                )}
                
                {/* User Card */}
                <div className="flex-1">
                  <EnhancedUserProfileCard
                    user={user}
                    variant={variant}
                    showActions={true}
                    showStats={false}
                    showSkills={false}
                    onFollow={onFollow}
                    onMessage={onMessage}
                    onViewProfile={onViewProfile}
                    onShare={onShare}
                    onEdit={onEdit}
                    onContact={onContact}
                    className="border-0 shadow-none p-0"
                  />
                </div>
                
                {/* Position Indicator */}
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
