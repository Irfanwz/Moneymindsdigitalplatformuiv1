import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { LandingPage } from "@/app/components/LandingPage";
import { LoginPage } from "@/app/components/LoginPage";
import { ProfileApplicationPage } from "@/app/components/ProfileApplicationPage";
import { RoleSelectionPage } from "@/app/components/RoleSelectionPage";
import { StartupDashboard } from "@/app/components/dashboards/StartupDashboard";
import { InvestorDashboard } from "@/app/components/dashboards/InvestorDashboard";
import { AdvisorDashboard } from "@/app/components/dashboards/AdvisorDashboard";
import { StartupAnalytics } from "@/app/components/dashboards/StartupAnalytics";
import { InvestorAnalytics } from "@/app/components/dashboards/InvestorAnalytics";
import { AdvisorAnalytics } from "@/app/components/dashboards/AdvisorAnalytics";
import { AdminDashboard } from "@/app/components/dashboards/AdminDashboard";
import { StartupProfile } from "@/app/components/profiles/StartupProfile";
import { InvestorProfile } from "@/app/components/profiles/InvestorProfile";
import { AdvisorProfile } from "@/app/components/profiles/AdvisorProfile";
import { AdminProfile } from "@/app/components/profiles/AdminProfile";
import { StartupEditProfile } from "@/app/components/profiles/StartupEditProfile";
import { InvestorEditProfile } from "@/app/components/profiles/InvestorEditProfile";
import { AdvisorEditProfile } from "@/app/components/profiles/AdvisorEditProfile";
import { FindAdvisorsPage } from "@/app/components/FindAdvisorsPage";
import { AdvisorGroupsPage } from "@/app/components/advisor/AdvisorGroupsPage";
import { CreatePostSignalPage } from "@/app/components/advisor/CreatePostSignalPage";
import { AIAgentsPage } from "@/app/components/investor/AIAgentsPage";
import { AdvisorTrainingsPage } from "@/app/components/advisor/AdvisorTrainingsPage";
import { AdvisorSessionsPage } from "@/app/components/advisor/AdvisorSessionsPage";
import { TrainingMarketplace } from "@/app/components/shared/TrainingMarketplace";
import { TrainingDetailPage } from "@/app/components/shared/TrainingDetailPage";
import { ForgotPasswordPage } from "@/app/components/ForgotPasswordPage";
import { ResetPasswordPage } from "@/app/components/ResetPasswordPage";
import { PublicAdvisorProfile } from "@/app/components/profiles/PublicAdvisorProfile";
import { PublicStartupProfile } from "@/app/components/profiles/PublicStartupProfile";
import { BrowseGroupsPage } from "@/app/components/shared/BrowseGroupsPage";
import { PredictionHistoryPage } from "@/app/components/signals/PredictionHistoryPage";
import { VerificationUploadPage } from "@/app/components/verification/VerificationUploadPage";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { AuthProvider, useAuth } from "@/app/contexts/AuthContext";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
import { RequireAdmin, RequireRole, RequireSignedIn } from "@/app/components/auth/RouteGuards";
import { Toaster } from "@/app/components/ui/sonner";

function GroupPredictionsRoute() {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  return (
    <DashboardLayout userRole="advisor" userName={user?.fullName ?? ""}>
      <div className="p-6 max-w-3xl mx-auto">
        <PredictionHistoryPage groupId={groupId!} />
      </div>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/apply" element={<ProfileApplicationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route element={<RequireSignedIn />}>
              <Route path="/choose-role" element={<RoleSelectionPage />} />
            </Route>

            <Route element={<RequireRole role="startup" />}>
              <Route path="/startup/dashboard" element={<StartupDashboard />} />
              <Route path="/startup/analytics" element={<StartupAnalytics />} />
              <Route path="/startup/profile" element={<StartupProfile />} />
              <Route path="/startup/edit-profile" element={<StartupEditProfile />} />
              <Route path="/startup/trainings" element={<TrainingMarketplace userRole="startup" />} />
              <Route path="/startup/trainings/:id" element={<TrainingDetailPage userRole="startup" />} />
              <Route path="/startup/find-advisors" element={<FindAdvisorsPage userRole="startup" />} />
              <Route path="/startup/groups" element={<BrowseGroupsPage userRole="startup" />} />
            </Route>

            <Route element={<RequireRole role="investor" />}>
              <Route path="/investor/dashboard" element={<InvestorDashboard />} />
              <Route path="/investor/analytics" element={<InvestorAnalytics />} />
              <Route path="/investor/profile" element={<InvestorProfile />} />
              <Route path="/investor/edit-profile" element={<InvestorEditProfile />} />
              <Route path="/investor/ai-agents" element={<AIAgentsPage />} />
              <Route path="/investor/trainings" element={<TrainingMarketplace userRole="investor" />} />
              <Route path="/investor/trainings/:id" element={<TrainingDetailPage userRole="investor" />} />
              <Route path="/investor/find-advisors" element={<FindAdvisorsPage userRole="investor" />} />
              <Route path="/investor/groups" element={<BrowseGroupsPage userRole="investor" />} />
            </Route>

            <Route element={<RequireRole role="advisor" />}>
              <Route path="/advisor/dashboard" element={<AdvisorDashboard />} />
              <Route path="/advisor/analytics" element={<AdvisorAnalytics />} />
              <Route path="/advisor/profile" element={<AdvisorProfile />} />
              <Route path="/advisor/edit-profile" element={<AdvisorEditProfile />} />
              <Route path="/advisor/sessions" element={<AdvisorSessionsPage />} />
              <Route path="/advisor/groups" element={<AdvisorGroupsPage />} />
              <Route path="/advisor/groups/:groupId/create-signal" element={<CreatePostSignalPage />} />
              <Route path="/advisor/groups/:groupId/predictions" element={<GroupPredictionsRoute />} />
              <Route path="/advisor/trainings" element={<AdvisorTrainingsPage />} />
              <Route path="/advisor/trainings/:id" element={<TrainingDetailPage userRole="advisor" />} />
            </Route>

            {/* Verification — available to all signed-in users */}
            <Route element={<RequireSignedIn />}>
              <Route path="/verify" element={<VerificationUploadPage />} />
            </Route>

            {/* Public profile routes (any signed-in user) */}
            <Route element={<RequireSignedIn />}>
              <Route path="/advisors/:userId/profile" element={<PublicAdvisorProfile />} />
              <Route path="/startups/:userId/profile" element={<PublicStartupProfile />} />
            </Route>

            <Route element={<RequireAdmin />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
