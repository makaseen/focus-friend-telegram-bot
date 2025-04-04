
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CalendarProvider } from "./contexts/CalendarContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <CalendarProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* OAuth routes - make them all use the AuthCallback component */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/google" element={<AuthCallback />} />
            
            {/* Additional OAuth routes for Telegram bot integration */}
            <Route path="/auth/google/:state" element={<AuthCallback />} />
            
            {/* Catch-all for auth paths */}
            <Route path="/auth/*" element={<AuthCallback />} />
            
            {/* Default 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CalendarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
