import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MetaCookieProvider } from "@/contexts/MetaCookieContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import ProductLanding from "./pages/ProductLanding";
import ThankYou from "./pages/ThankYou";
import LandingsIndex from "./pages/LandingsIndex";

const queryClient = new QueryClient();

const App = () => (
  <MetaCookieProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/p/:slug" element={<ProductLanding />} />
            <Route path="/landings" element={<LandingsIndex />} />
            <Route path="/obrigado" element={<ThankYou />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </MetaCookieProvider>
);

export default App;
