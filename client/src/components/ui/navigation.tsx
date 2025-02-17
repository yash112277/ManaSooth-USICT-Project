import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { Home, ArrowLeft, User, Brain } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Navigation() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const goBack = () => {
    window.history.back();
  };

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
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
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                MANASOOTH
              </span>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  {user.username}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}