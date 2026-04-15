import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import IntroductionList from "./pages/IntroductionList";
import IntroductionDetail from "./pages/IntroductionDetail";
import IntroductionForm from "./pages/IntroductionForm";
import Announcements from "./pages/Announcements";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminParticipants from "./pages/admin/AdminParticipants";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout><Index /></Layout>} />
      <Route path="/introductions" element={<ProtectedRoute><Layout><IntroductionList /></Layout></ProtectedRoute>} />
      <Route path="/introductions/new" element={<ProtectedRoute><Layout><IntroductionForm /></Layout></ProtectedRoute>} />
      <Route path="/introductions/:id/edit" element={<ProtectedRoute><Layout><IntroductionForm /></Layout></ProtectedRoute>} />
      <Route path="/introductions/:id" element={<ProtectedRoute><Layout><IntroductionDetail /></Layout></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute><Layout><Announcements /></Layout></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<AdminRoute><Layout><AdminAnnouncements /></Layout></AdminRoute>} />
      <Route path="/admin/participants" element={<AdminRoute><Layout><AdminParticipants /></Layout></AdminRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
