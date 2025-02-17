import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { Home, ArrowLeft } from "lucide-react";

export function Navigation() {
  const [location, setLocation] = useLocation();

  const goBack = () => {
    window.history.back();
  };

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {location !== "/" && (
            <>
              <Button variant="ghost" size="icon" onClick={goBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Language selector will go here */}
        </div>
      </div>
    </nav>
  );
}
