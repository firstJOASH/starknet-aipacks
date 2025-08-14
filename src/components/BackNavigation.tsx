import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackNavigationProps {
  className?: string;
}

export const BackNavigation = ({ className = "" }: BackNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const canGoBack = window.history.length > 1 && location.pathname !== "/";
  const isNotHome = location.pathname !== "/";

  if (!canGoBack && !isNotHome) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 mb-6 ${className}`}>
      {canGoBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      )}
      
      {isNotHome && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoHome}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Button>
      )}
    </div>
  );
};