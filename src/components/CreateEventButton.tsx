import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const CreateEventButton = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCreateEvent = () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    navigate('/create-event');
  };

  return (
    <Button onClick={handleCreateEvent} className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Create Event
    </Button>
  );
};
