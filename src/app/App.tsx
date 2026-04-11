import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "@/app/components/LandingPage";
import { LoginPage } from "@/app/components/LoginPage";
import { StartupDashboard } from "@/app/components/dashboards/StartupDashboard";
import { InvestorDashboard } from "@/app/components/dashboards/InvestorDashboard";
import { AdvisorDashboard } from "@/app/components/dashboards/AdvisorDashboard";
import { AdminDashboard } from "@/app/components/dashboards/AdminDashboard";
import { StartupProfile } from "@/app/components/profiles/StartupProfile";
import { InvestorProfile } from "@/app/components/profiles/InvestorProfile";
import { AdvisorProfile } from "@/app/components/profiles/AdvisorProfile";
import { AdminProfile } from "@/app/components/profiles/AdminProfile";
import { StartupEditProfile } from "@/app/components/profiles/StartupEditProfile";
import { InvestorEditProfile } from "@/app/components/profiles/InvestorEditProfile";
import { AdvisorEditProfile } from "@/app/components/profiles/AdvisorEditProfile";
import { AdvisorGroupsPage } from "@/app/components/advisor/AdvisorGroupsPage";
import { CreatePostSignalPage } from "@/app/components/advisor/CreatePostSignalPage";
import { AIAgentsPage } from "@/app/components/investor/AIAgentsPage";
import { AdvisorTrainingsPage } from "@/app/components/advisor/AdvisorTrainingsPage";
import { TrainingMarketplace } from "@/app/components/shared/TrainingMarketplace";
import { ThemeProvider } from "@/app/contexts/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Startup Routes */}
          <Route path="/startup/dashboard" element={<StartupDashboard />} />
          <Route path="/startup/profile" element={<StartupProfile />} />
          <Route path="/startup/edit-profile" element={<StartupEditProfile />} />
          <Route path="/startup/trainings" element={<TrainingMarketplace userRole="startup" />} />

          {/* Investor Routes */}
          <Route path="/investor/dashboard" element={<InvestorDashboard />} />
          <Route path="/investor/profile" element={<InvestorProfile />} />
          <Route path="/investor/edit-profile" element={<InvestorEditProfile />} />
          <Route path="/investor/ai-agents" element={<AIAgentsPage />} />
          <Route path="/investor/trainings" element={<TrainingMarketplace userRole="investor" />} />

          {/* Advisor Routes */}
          <Route path="/advisor/dashboard" element={<AdvisorDashboard />} />
          <Route path="/advisor/profile" element={<AdvisorProfile />} />
          <Route path="/advisor/edit-profile" element={<AdvisorEditProfile />} />
          <Route path="/advisor/groups" element={<AdvisorGroupsPage />} />
          <Route path="/advisor/groups/:groupId/create-signal" element={<CreatePostSignalPage />} />
          <Route path="/advisor/trainings" element={<AdvisorTrainingsPage />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<AdminProfile />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}