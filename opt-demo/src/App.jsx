import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // ToastContainer'ı ekledik
import 'react-toastify/dist/ReactToastify.css'; // CSS'i ekledik

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import RegisterPage from './components/auth/RegisterPage';
import LoginPage from './components/auth/LoginPage';
import HomePage from './components/home/HomePage';
import WorkoutPage from './components/workout-meal-appointment/WorkoutPage';
import MealPage from './components/workout-meal-appointment/MealPage';
import AvailabilityPage from './components/workout-meal-appointment/AvailabilityPage';
import ApprovalPendingPage from './components/statuspages/ApprovalPendingPage';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from '@stripe/react-stripe-js';
import ApiService from './services/ApiService';
import PaymentPage from './components/payment/PaymentPage';
import ProfilePage from './components/profile/ProfilePage';
import AdminLayout from './components/admin/navbar/AdminLayout';
import AdminSelectCustomerPage from './components/admin/AdminCustomerApprovalPage';
import AdminAvailabilityPage from './components/admin/AdminAvailabilityPage';
import AdminAppointmentPage from './components/admin/AdminAppointmentPage';
import AdminCustomerApprovalPage from './components/admin/AdminCustomerApprovalPage';
import AdminCustomerMealPage from './components/admin/AdminCustomerMealPage';
import AdminCustomerWorkoutPage from './components/admin/AdminCustomerWorkoutPage';

const stripePromise = loadStripe("pk_test_51RqXGu4HGh7j85I0pxwx0POSq9GOqTSpgNMKDnqPZXizdGk8VV45AX2tICBuUMm1vyDCnFuze26MyCBISOrMoSQn006vkIi6oq");

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Veri yükleme durumu için yeni bir state
    const [userName, setUserName] = useState(null);

  // Uygulama ilk yüklendiğinde çalışacak ana useEffect.
  // Bu, hem token'ı hem de kullanıcı bilgilerini tek bir yerden kontrol eder.
  useEffect(() => {
    const checkAuthStatus = async () => {
      const tokenExists = ApiService.isAuthenticated();

      if (tokenExists) {
        // Eğer token varsa, login durumunu true yap.
        setIsLoggedIn(true);

        // Token ile kullanıcı bilgilerini çek
          const userInfoResponse = await ApiService.myProfile();
          const userId = userInfoResponse.data.id;
          
          setUserName(userInfoResponse.data.name);
        try {
          
          if (userId) {
            ApiService.saveUserId(userId); // userId'yi storage'a kaydet
            const statusResponse = await ApiService.getUserStatus(userId);
            setUserStatus(statusResponse);
          }
        } catch (error) {
          console.error("Kullanıcı bilgileri çekilirken hata oluştu:", error);
          // Hata durumunda kullanıcıyı logout yap
          ApiService.logout();
          setIsLoggedIn(false);
        }
      } else {
        // Token yoksa logout durumunu ayarla
        setIsLoggedIn(false);
        setUserStatus(null);
      }
      setIsLoading(false); // İşlemler tamamlandığında loading durumunu false yap.
    };

    checkAuthStatus();
  }, []); // Sadece ilk render'da çalışır.

  // JSX içinde bir loading ekranı ekleyerek kullanıcıya bilgi verebilirsiniz.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      
        <Navbar 
          isLoggedIn={isLoggedIn}
          userStatus={userStatus}
          setIsLoggedIn={setIsLoggedIn}
          setUserStatus={setUserStatus}
          userName={userName}
          setUserName={setUserName}
        />
        <Routes>
          <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} userStatus={userStatus} />} />
          <Route path="/home" element={<HomePage isLoggedIn={isLoggedIn} userStatus={userStatus} />} />
          <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/approval-pending" element={<ApprovalPendingPage />} />
          {/* PaymentPage'i <Elements> ile sarıyoruz */}
                <Route path="/payment" element={
                    <Elements stripe={stripePromise}>
                        <PaymentPage />
                    </Elements>
                } />

          <Route path="/workouts" element={<WorkoutPage />} />
          <Route path="/meals" element={<MealPage />} />
          <Route path="/appointments" element={<AvailabilityPage />} />

          <Route path="/profile" element={<ProfilePage />} />

           {/* Admin rotaları: */}
            <Route path="/admin/home" element={<AdminLayout />}>
                {/* Ana admin sayfası veya müşteri seçme sayfası */}
                <Route index element={<AdminCustomerApprovalPage />} /> 
                {/* Müsaitlik yönetimi sayfası */}
                <Route path="availability" element={<AdminAvailabilityPage />} />
                {/* Müşteri ID'sine bağlı alt rotalar */}
                <Route path="customer/:customerId/appointments" element={<AdminAppointmentPage />} />
                <Route path="customer/:customerId/meals" element={<AdminCustomerMealPage />} />
                <Route path="customer/:customerId/workouts" element={<AdminCustomerWorkoutPage />} />
            </Route>

          
          
        </Routes>
        <Footer />
       <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </BrowserRouter>
  );
}

export default App;
