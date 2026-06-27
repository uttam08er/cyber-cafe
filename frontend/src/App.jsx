import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import {
  ProtectedRoute,
  AdminRoute,
  GuestRoute,
} from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

// Public pages
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import ApplyServicePage from "./pages/ApplyServicePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ContactPage from "./pages/ContactPage";
import BookingPage from "./pages/BookingPage";
import UpdatesPage from "./pages/UpdatesPage";
import NotFoundPage from "./pages/NotFoundPage";

// User dashboard
import DashboardPage from "./pages/DashboardPage";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import MyRequests from "./pages/dashboard/MyRequests";
import MyBookings from "./pages/dashboard/MyBookings";
import ProfilePage from "./pages/dashboard/ProfilePage";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminServices from "./pages/admin/AdminServices";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminUpdates from "./pages/admin/AdminUpdates";
import ScrollToTop from "./components/common/ScrollToTop";

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />
        <Route
          path="/services"
          element={
            <PublicLayout>
              <ServicesPage />
            </PublicLayout>
          }
        />
        <Route
          path="/updates"
          element={
            <PublicLayout>
              <UpdatesPage />
            </PublicLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicLayout>
              <ContactPage />
            </PublicLayout>
          }
        />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/services/apply/:serviceId"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <ApplyServicePage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <BookingPage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <DashboardPage />
              </PublicLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="requests" element={<MyRequests />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="updates" element={<AdminUpdates />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
