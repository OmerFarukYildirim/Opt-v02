import { useNavigate, Link, useLocation } from "react-router-dom";
import { useError } from "../common/ErrorDisplay";
import { useState } from "react";
import ApiService from "../../services/ApiService"; // Eksikse bunu da unutma
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebook, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const LoginPage = ({ setIsLoggedIn }) => {
    const { ErrorDisplay, showError } = useError();
    const navigate = useNavigate();
    const { state } = useLocation();
    


    const [isLoading, setIsLoading] = useState(false); // ← BU SATIR EKSİKTİ

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        setIsLoading(true); // ← Form gönderimi başladığında loading true olsun

        if (!formData.email || !formData.password) {
            showError('Email and password are required.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await ApiService.loginUser(formData);
            if (response.statusCode === 200) {
                ApiService.saveToken(response.data.token);
                ApiService.saveRole(response.data.roles);
                setIsLoggedIn(true);
                const userInfoResponse = await ApiService.myProfile();
                const userInfo = userInfoResponse.data;
                ApiService.saveUserId(userInfo.id);
                    const newStatusResponse = await ApiService.getUserStatus(userInfo.id);
                    const newStatus = newStatusResponse.data;
                    
                    console.log(newStatusResponse.data);
                    const userId = userInfo.id;
                    console.log(userId);

                if (userInfo && userInfo.id) {
                    ApiService.saveUserId(userId);
                   ApiService.setUserStatus(userId,newStatus);
                } else {
                    console.warn("API yanıtında user bilgisi yok:", response.data);
                }
                navigate('/approval-pending');
            } else {
                showError(response.message);
            }
        } catch (error) {
            showError(error.response?.data?.message || error.message);
        } finally {
            setIsLoading(false); // ← Ne olursa olsun form gönderimi bittiğinde loading false
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Giriş Yap</h2>
                </div>

                <ErrorDisplay />

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
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
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Şifreniz"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        ) : (
                            'Giriş Yap'
                        )}
                    </button>

                    <div className="text-center text-sm">
                        <Link to="/register" className="font-medium text-orange-600 hover:text-orange-500">
                            Hesabınız yok mu? Kayıt Ol
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

export default LoginPage;
