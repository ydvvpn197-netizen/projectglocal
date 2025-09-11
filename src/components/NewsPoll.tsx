// NewsPoll component for creating and voting on polls
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  X, 
  BarChart3, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNewsPolls, useNewsRealtime } from '@/hooks/useNews.tsx';
import { formatDistanceToNow } from 'date-fns';
import type { NewsPoll as NewsPollType } from '@/types/news';

interface NewsPollProps {
  articleId: string;
  onClose: () => void;
}

export const NewsPoll: React.FC<NewsPollProps> = React.memo(({ articleId, onClose }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [selectedPoll, setSelectedPoll] = useState<NewsPollType | null>(null);

  const { polls, loading, createPoll, votePoll, refetch } = useNewsPolls(articleId);
  
  // Real-time subscriptions for live poll updates
  const realtimeUpdates = useNewsRealtime([articleId]);
  
  // Handle real-time updates
  React.useEffect(() => {
    if (realtimeUpdates.length > 0) {
      // Refresh polls when real-time updates are received
      refetch();
    }
  }, [realtimeUpdates, refetch]);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = async () => {
    if (!question.trim() || options.filter(opt => opt.trim()).length < 2) {
      return;
    }

    try {
      await createPoll(question, options.filter(opt => opt.trim()));
      setQuestion('');
      setOptions(['', '']);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      await votePoll(pollId, optionIndex);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getTotalVotes = (poll: NewsPollType) => {
    return poll.vote_counts?.reduce((sum, count) => sum + count, 0) || 0;
  };

  const getUserVote = (poll: NewsPollType) => {
    return poll.user_vote;
  };

  const isPollExpired = (poll: NewsPollType) => {
    if (!poll.expires_at) return false;
    return new Date(poll.expires_at) < new Date();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            News Polls
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create Poll Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Poll
            </Button>
          </div>

          {/* Create Poll Form */}
          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Create New Poll</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="question">Question</Label>
                      <Input
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="What's your opinion on this news?"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Options</Label>
                      <div className="space-y-2 mt-2">
                        {options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1"
                            />
                            {options.length > 2 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveOption(index)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      {options.length < 6 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddOption}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Option
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCreatePoll} disabled={!question.trim() || options.filter(opt => opt.trim()).length < 2}>
                        Create Poll
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Polls List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : polls.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No polls yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Be the first to create a poll about this news!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {polls.map((poll) => (
                <motion.div
                  key={poll.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{poll.question}</CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{getTotalVotes(poll)} votes</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}</span>
                            </div>
                            {isPollExpired(poll) && (
                              <Badge variant="secondary" className="text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Expired
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {poll.user_name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {poll.options.map((option, index) => {
                          const voteCount = poll.vote_counts?.[index] || 0;
                          const totalVotes = getTotalVotes(poll);
                          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                          const isUserVote = getUserVote(poll) === index;
                          const isExpired = isPollExpired(poll);

                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {option}
                                </span>
                                <div className="flex items-center gap-2">
                                  {isUserVote && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {voteCount} ({percentage.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                              <Progress value={percentage} className="h-2" />
                              {!isExpired && getUserVote(poll) === undefined && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleVote(poll.id, index)}
                                  className="w-full"
                                >
                                  Vote
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
