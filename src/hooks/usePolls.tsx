import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  options: PollOption[];
  total_votes: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
  has_voted?: boolean;
  user_vote?: string;
  time_remaining?: string;
}

export const usePolls = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPolls = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          profiles!polls_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user's votes
      const { data: userVotes } = await supabase
        .from('poll_votes')
        .select('poll_id, option_id')
        .eq('user_id', user?.id);

      const userVoteMap = new Map(userVotes?.map(vote => [vote.poll_id, vote.option_id]) || []);

      const pollsWithAuthor = data?.map(poll => {
        const hasVoted = userVoteMap.has(poll.id);
        const userVote = userVoteMap.get(poll.id);
        
        // Calculate time remaining
        let timeRemaining = '';
        if (poll.expires_at) {
          const now = new Date();
          const expiresAt = new Date(poll.expires_at);
          const diffMs = expiresAt.getTime() - now.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          
          if (diffMs <= 0) {
            timeRemaining = 'Expired';
          } else if (diffDays > 0) {
            timeRemaining = `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
          } else {
            timeRemaining = `${diffHours} hour${diffHours > 1 ? 's' : ''} left`;
          }
        }

        return {
          ...poll,
          author_name: poll.profiles?.full_name || 'Anonymous',
          author_avatar: poll.profiles?.avatar_url,
          has_voted: hasVoted,
          user_vote: userVote,
          time_remaining: timeRemaining
        };
      }) || [];

      setPolls(pollsWithAuthor);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast({
        title: "Error",
        description: "Failed to load polls.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPoll = async (pollData: {
    title: string;
    description?: string;
    options: { id: string; text: string; votes: number }[];
    expires_at?: string;
  }) => {
    try {
      setCreating(true);
      
      const { data, error } = await supabase
        .from('polls')
        .insert({
          user_id: user?.id,
          ...pollData
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Poll Created",
        description: "Your poll has been created successfully.",
      });

      // Refresh polls
      await fetchPolls();
      
      return { success: true, poll: data };
    } catch (error: any) {
      console.error('Error creating poll:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create poll.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setCreating(false);
    }
  };

  const votePoll = async (pollId: string, optionId: string) => {
    try {
      // Check if user already voted
      const existingVote = await supabase
        .from('poll_votes')
        .select('id, option_id')
        .eq('poll_id', pollId)
        .eq('user_id', user?.id)
        .single();

      if (existingVote.data) {
        // Update existing vote
        const { error } = await supabase
          .from('poll_votes')
          .update({ option_id: optionId })
          .eq('poll_id', pollId)
          .eq('user_id', user?.id);

        if (error) throw error;

        toast({
          title: "Vote Updated",
          description: "Your vote has been updated.",
        });
      } else {
        // Create new vote
        const { error } = await supabase
          .from('poll_votes')
          .insert({
            poll_id: pollId,
            user_id: user?.id,
            option_id: optionId
          });

        if (error) throw error;

        toast({
          title: "Vote Recorded",
          description: "Thank you for participating in the poll.",
        });
      }

      // Refresh polls to update vote counts
      await fetchPolls();
    } catch (error: any) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record vote.",
        variant: "destructive",
      });
    }
  };

  const deletePoll = async (pollId: string) => {
    try {
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Poll Deleted",
        description: "Your poll has been deleted.",
      });

      // Refresh polls
      await fetchPolls();
    } catch (error: any) {
      console.error('Error deleting poll:', error);
      toast({
        title: "Error",
        description: "Failed to delete poll.",
        variant: "destructive",
      });
    }
  };

  const sharePoll = async (pollId: string) => {
    try {
      const pollUrl = `${window.location.origin}/community/poll/${pollId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Community Poll',
          text: 'Check out this community poll!',
          url: pollUrl
        });
      } else {
        await navigator.clipboard.writeText(pollUrl);
        toast({
          title: "Link Copied",
          description: "Poll link has been copied to clipboard.",
        });
      }
    } catch (error) {
      console.error('Error sharing poll:', error);
      toast({
        title: "Error",
        description: "Failed to share poll.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchPolls();
    }
  }, [user]);

  return {
    polls,
    loading,
    creating,
    createPoll,
    votePoll,
    deletePoll,
    sharePoll,
    fetchPolls
  };
};
