import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { AuthProvider } from "@/hooks/use-auth";
import Home from "@/pages/home";
import Assessment from "@/pages/assessment";
import Resources from "@/pages/resources";
import Consultation from "@/pages/consultation";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import Auth from "@/pages/auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/resources" component={Resources} />
      <Route path="/consultation" component={Consultation} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/auth" component={Auth} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;