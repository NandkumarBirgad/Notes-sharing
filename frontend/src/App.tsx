import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Index from "./pages/Index";
import BranchPage from "./pages/BranchPage";
import BranchYearPage from "./pages/BranchYearPage";
import SemesterPage from "./pages/SemesterPage";
import SubjectPage from "./pages/SubjectPage";
import UploadPage from "./pages/UploadPage";
import AdminPage from "./pages/AdminPage";
import SearchPage from "./pages/SearchPage";
import ViewPage from "./pages/ViewPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();

  const showNavbar = location.pathname === "/";
  const showFooter = location.pathname === "/";

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        {/* Home – Branch Cards */}
        <Route path="/" element={<Index />} />

        {/* Branch → Year → Semester → Subject flow */}
        <Route path="/branch/:branchId" element={<BranchPage />} />
        <Route path="/branch/:branchId/year/:yearId" element={<BranchYearPage />} />
        <Route path="/branch/:branchId/year/:yearId/semester/:semesterId" element={<SemesterPage />} />
        <Route path="/branch/:branchId/year/:yearId/semester/:semesterId/subject/:subjectId" element={<SubjectPage />} />

        {/* Direct subject access (from search results) */}
        <Route path="/subject/:subjectId" element={<SubjectPage />} />

        {/* Viewer */}
        <Route path="/view/:resourceId" element={<ViewPage />} />

        {/* Utility pages */}
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/search" element={<SearchPage />} />

        {/* Legacy redirects – old year-based URLs */}
        <Route path="/year/:yearId" element={<Navigate to="/" replace />} />
        <Route path="/year/:yearId/semester/:semesterId" element={<Navigate to="/" replace />} />
        <Route path="/year/:yearId/semester/:semesterId/subject/:subjectName" element={<Navigate to="/" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      {showFooter && <Footer />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;