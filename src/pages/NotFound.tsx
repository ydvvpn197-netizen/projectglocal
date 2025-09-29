import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { StandardPageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <StandardPageLayout
      title="404 - Page Not Found"
      subtitle="Oops! Something went wrong"
      description="The page you're looking for doesn't exist or has been moved."
      variant="hero"
      background="gradient"
      maxWidth="lg"
      badges={[
        { label: "Error", variant: "destructive", icon: <div className="w-2 h-2 bg-red-500 rounded-full" /> },
        { label: "404", variant: "secondary" }
      ]}
      actions={
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            className="text-base px-6 py-3"
            onClick={() => window.location.href = '/'}
          >
            <Home className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-base px-6 py-3"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      }
    >
      <div className="text-center py-16">
        <div className="text-8xl font-bold text-muted-foreground mb-4">404</div>
        <p className="text-xl text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
    </StandardPageLayout>
  );
};

export default NotFound;
