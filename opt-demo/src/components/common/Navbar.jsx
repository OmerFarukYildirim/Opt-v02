import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../services/ApiService';    
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle, faUserShield } from '@fortawesome/free-solid-svg-icons'; // faUserShield ikonunu ekledik

// userName ve userRole prop'larını ekledik
const Navbar = ({ isLoggedIn, setIsLoggedIn, userName, userStatus }) => {
    // Çıkış yapma fonksiyonu
    const logout = () => {
        ApiService.logout();
        setIsLoggedIn(false); // state güncelle
        window.location.href = '/login';
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between h-16 items-center">
                    {/* Marka İsmi / Ana Sayfa Linki */}
                    <Link to="/" className="flex items-center py-5 px-2 text-gray-700 hover:text-orange-500 font-bold">
                        <h1 className="text-2xl">Personal Trainer App</h1>
                    </Link>

                    {/* Sağ Taraftaki Butonlar - Koşullu Render */}
                    <div className="flex items-center space-x-4">
                        {isLoggedIn ? (
                            <>
                                

                                {/* Admin butonu: Sadece rolü 'ADMIN' ise göster */}
                                {userStatus.data === 'ADMIN' && (
                                    <Link to="/admin/home" className="py-2 px-3 text-gray-700 hover:text-orange-500 transition-colors" title="Müşteri Seç">
                                        <FontAwesomeIcon icon={faUserShield} size="2x" />
                                    </Link>
                                )}

                                {/* Profil Butonu (Giriş Yapılmışsa) */}
                                <Link to="/profile" className="py-2 px-3 text-gray-700 hover:text-orange-500 transition-colors" title="Profilim">
                                    <FontAwesomeIcon icon={faUserCircle} size="2x" />
                                </Link>

                                {/* Kullanıcı Adı */}
                                <span className="text-gray-700 font-medium">{userName}</span>

                                {/* Çıkış Yap Butonu (Giriş Yapılmışsa) */}
                                <button
                                    onClick={logout}
                                    className="py-2 px-3 text-gray-700 hover:text-red-500 transition-colors"
                                    title="Çıkış Yap"
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} size="2x" />
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Giriş Yap Butonu (Giriş Yapılmamışsa) */}
                                <Link
                                    to="/login"
                                    className="py-2 px-3 text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
                                >
                                    Giriş Yap
                                </Link>

                                {/* Kayıt Ol Butonu (Giriş Yapılmamışsa) */}
                                <Link
                                    to="/register"
                                    className="py-2 px-3 text-orange-600 border border-orange-600 rounded-md hover:bg-orange-50 transition-colors"
                                >
                                    Kayıt Ol
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
