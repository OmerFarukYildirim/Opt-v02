// src/home/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ApiService from "../../services/ApiService"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faUtensils, faDumbbell } from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {
    const isLoggedIn = ApiService.isAuthenticated();
    console.log("Is user logged in?", isLoggedIn);
    // Kullanıcı giriş yapmamışsa, giriş yapmaya yönlendiren basit bir ekran
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Hoş Geldiniz!
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Devam etmek için lütfen giriş yapın veya yeni bir hesap oluşturun.
                    </p>
                    <div className="space-x-4">
                        <Link 
                            to="/login" 
                            className="bg-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-orange-700 transition-colors"
                        >
                            Giriş Yap
                        </Link>
                        <Link 
                            to="/register" 
                            className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-300 transition-colors"
                        >
                            Kayıt Ol
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Kullanıcı giriş yapmışsa, ana işlevlerin butonları gösterilir
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-10">
                Ana Sayfa
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
                {/* Randevu Seçme Butonu */}
                <Link 
                    to="/appointments" 
                    className="flex flex-col items-center justify-center bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
                >
                    <FontAwesomeIcon icon={faCalendarCheck} className="text-6xl text-orange-500 mb-4" />
                    <span className="text-lg font-semibold text-gray-700">Randevu Seç</span>
                </Link>

                {/* Öğünler Butonu */}
                <Link 
                    to="/meals" 
                    className="flex flex-col items-center justify-center bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
                >
                    <FontAwesomeIcon icon={faUtensils} className="text-6xl text-blue-500 mb-4" />
                    <span className="text-lg font-semibold text-gray-700">Öğünler</span>
                </Link>

                {/* Spor Programı Butonu */}
                <Link 
                    to="/workouts" 
                    className="flex flex-col items-center justify-center bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
                >
                    <FontAwesomeIcon icon={faDumbbell} className="text-6xl text-green-500 mb-4" />
                    <span className="text-lg font-semibold text-gray-700">Spor Programı</span>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;