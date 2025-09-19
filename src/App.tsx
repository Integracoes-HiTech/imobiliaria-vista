import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import AdvancedSearch from "./pages/AdvancedSearch";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PropertiesManager from "./pages/admin/PropertiesManager";
import PropertyForm from "./pages/admin/PropertyForm";
import RealtorsManager from "./pages/admin/RealtorsManager";
import RealtorForm from "./pages/admin/RealtorForm";
import RealtorLogin from "./pages/realtor/RealtorLogin";
import RealtorDashboard from "./pages/realtor/RealtorDashboard";
import RealtorPropertiesManager from "./pages/realtor/RealtorPropertiesManager";
import RealtorPropertyForm from "./pages/realtor/RealtorPropertyForm";
import RealtorResetPassword from "./pages/realtor/RealtorResetPassword";
import RealtorProfile from "./pages/realtor/RealtorProfile";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import DatabaseTest from "./components/DatabaseTest";
import LoginTest from "./components/LoginTest";
import DatabaseDebug from "./components/DatabaseDebug";
import ImageUploadTest from "./components/ImageUploadTest";
import BucketTest from "./components/BucketTest";
import BucketDebug from "./components/BucketDebug";
import NewBucketTest from "./components/NewBucketTest";
import ConnectionTest from "./components/ConnectionTest";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/search" element={<AdvancedSearch />} />
            <Route path="/login" element={<Login />} />
            <Route path="/test-db" element={<DatabaseTest />} />
            <Route path="/debug-db" element={<DatabaseDebug />} />
            <Route path="/test-upload" element={<ImageUploadTest />} />
            <Route path="/test-bucket" element={<BucketTest />} />
            <Route path="/debug-bucket" element={<BucketDebug />} />
            <Route path="/test-new-bucket" element={<NewBucketTest />} />
            <Route path="/test-connection" element={<ConnectionTest />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/properties" element={<PropertiesManager />} />
            <Route path="/admin/properties/new" element={<PropertyForm />} />
            <Route path="/admin/properties/edit/:id" element={<PropertyForm />} />
            <Route path="/admin/realtors" element={<RealtorsManager />} />
            <Route path="/admin/realtors/new" element={<RealtorForm />} />
            
            {/* Realtor Routes */}
            <Route path="/realtor/login" element={<RealtorLogin />} />
            <Route path="/realtor/dashboard" element={<RealtorDashboard />} />
            <Route path="/realtor/properties" element={<RealtorPropertiesManager />} />
            <Route path="/realtor/properties/new" element={<RealtorPropertyForm />} />
            <Route path="/realtor/properties/edit/:id" element={<RealtorPropertyForm />} />
            <Route path="/realtor/reset-password" element={<RealtorResetPassword />} />
            <Route path="/realtor/profile/:id" element={<RealtorProfile />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
