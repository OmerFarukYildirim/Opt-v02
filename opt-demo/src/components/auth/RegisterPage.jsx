// src/components/auth/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ApiService from "../../services/ApiService";
// Hata hook'unuzun doğru yolu
import { useError } from '../common/ErrorDisplay'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebook, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

/**
 * Bu bileşen, kullanıcı kayıt sayfasını Tailwind CSS ile tasarlanmış bir formla sunar.
 * Yeni versiyonda PT telefon numarası da alınır ve kullanıcı kayıt sonrası onay bekleme sayfasına yönlendirilir.
 */
const RegisterPage = () => {
    // useError hook'u hata mesajlarını yönetmek için kullanılır
    const { ErrorDisplay, showError } = useError();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Form verilerini saklamak için state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        address: '',
        confirmPassword: '',
        ptPhoneNumber: '', // Yeni: PT telefon numarası
    });

    // Input değişikliklerini ele alan fonksiyon
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Form gönderimini ele alan asenkron fonksiyon
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Zorunlu alan kontrolü
        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.phoneNumber ||
            !formData.confirmPassword ||
            !formData.address ||
            !formData.ptPhoneNumber // Yeni: PT telefon numarası kontrolü
        ) {
            showError("Lütfen tüm alanları doldurun.");
            setIsLoading(false);
            return;
        }

        // Şifre eşleşme kontrolü
        if (formData.password !== formData.confirmPassword) {
            showError('Şifreler eşleşmiyor.');
            setIsLoading(false);
            return;
        }

        // Backend'e gönderilecek veriler
        const registrationData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
            ptPhoneNumber: formData.ptPhoneNumber, // Yeni: PT telefon numarasını ekle
        };

        try {
            const response = await ApiService.registerUser(registrationData);

            if (response.statusCode === 200) {
                // Başarılı kayıt sonrası formu temizle
                setFormData({
                    name: '', email: '', password: '', phoneNumber: '', address: '', confirmPassword: '', ptPhoneNumber: ''
                });
                // Kullanıcıyı onay bekleme sayfasına yönlendir
                navigate("/login");
            } else {
                showError(response.message);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Bir hata oluştu. Lütfen tekrar deneyin.";
            showError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Kayıt Ol</h2>
                </div>

                {/* Hata mesajı bileşeni */}
                <ErrorDisplay />
                
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="sr-only">Ad Soyad</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Ad Soyad"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">E-posta</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="E-posta Adresiniz"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Şifre</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Şifre"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Şifre Onayı</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="Şifreyi Onayla"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="sr-only">Telefon Numarası</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                                placeholder="Telefon Numarası"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="address" className="sr-only">Adres</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                placeholder="Adresiniz"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        {/* Yeni: PT Telefon Numarası inputu */}
                        <div>
                            <label htmlFor="ptPhoneNumber" className="sr-only">Eğitmeninizin Telefon Numarası</label>
                            <input
                                type="tel"
                                id="ptPhoneNumber"
                                name="ptPhoneNumber"
                                value={formData.ptPhoneNumber}
                                onChange={handleChange}
                                required
                                placeholder="Eğitmeninizin Telefon Numarası"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        ) : (
                            'Kayıt Ol'
                        )}
                    </button>
                    
                    <div className="text-center text-sm">
                        <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
                            Zaten hesabınız var mı? Giriş Yap
                        </Link>
                    </div>
                </form>

                <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Veya devam et</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        <FontAwesomeIcon icon={faGoogle} className="mr-2" />
                        Google ile devam et
                    </button>
                    <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        <FontAwesomeIcon icon={faFacebook} className="mr-2" />
                        Facebook ile devam et
                    </button>
                    <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        <FontAwesomeIcon icon={faGithub} className="mr-2" />
                        Github ile devam et
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;