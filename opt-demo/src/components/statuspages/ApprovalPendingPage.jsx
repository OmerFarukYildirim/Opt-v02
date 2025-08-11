import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import { useError } from '../common/ErrorDisplay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

/**
 * Bu bileşen, kullanıcının abonelik durumunu (PENDING, REJECTED) gösterir
 * ve duruma göre farklı UI'lar sunar.
 */
const ApprovalPendingPage = () => {
    const navigate = useNavigate();
    const { ErrorDisplay, showError } = useError();
    const [isLoading, setIsLoading] = useState(false);
    
    const [userStatus, setUserStatus] = useState(null); 
    const [userRole, setUserRole] = useState(null); // Yeni eklenen state
    const [newPtPhoneNumber, setNewPtPhoneNumber] = useState('');

    // Sayfa yüklendiğinde ve sadece bir kere çalışacak olan useEffect hook'u.
    useEffect(() => {
        const fetchUserStatus = async () => {
            const userInfoResponse = await ApiService.myProfile();
            const userId = userInfoResponse.data.id;
            const userRoleFromApi = userInfoResponse.data.role; // Rol bilgisini çekin
            console.log("User ID:", userId);
            
            if (!userId) {
                navigate('/login');
                return;
            }

            setUserRole(userRoleFromApi); // Rol bilgisini state'e kaydedin

            try {
                const statusResponse = await ApiService.getUserStatus(userId);
                
                if (statusResponse.statusCode === 200) {
                    setUserStatus(statusResponse.data);
                } else {
                    showError("Kullanıcı durumu alınamadı. Lütfen tekrar giriş yapın.");
                    navigate('/login');
                }
            } catch (error) {
                console.error("Kullanıcı durumu alınırken hata:", error);
                showError("Sunucuya bağlanırken bir hata oluştu.");
                navigate('/login');
            }
        };

        fetchUserStatus();
    }, [navigate, showError]); 
    
    // YENİ useEffect: userStatus ve userRole değiştiğinde navigasyon işlemlerini burada yapıyoruz.
    useEffect(() => {
        if (userStatus === 'ADMIN') {
            navigate('/admin/home', { replace: true });
        } else if (userStatus === 'APPROVE') {
            navigate('/payment', { replace: true });
        } else if (userStatus === 'ACTIVE') {
            navigate('/', { replace: true });
        }
    }, [userStatus, navigate]);


    /**
     * Eğitmen telefon numarası değiştirme isteğini gönderir.
     */
    const handleResubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const userInfoResponse = await ApiService.myProfile();
        const userId = userInfoResponse.data.id; 
        
        if (!userId) {
            showError("Kullanıcı bilgisi bulunamadı.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await ApiService.updatePtPhoneNumberAndStatus(userId, newPtPhoneNumber);

            if (response.statusCode === 200) {
                showError("İsteğiniz başarıyla gönderildi, lütfen tekrar bekleyin.");
                setUserStatus('PENDING');
                setNewPtPhoneNumber('');
            } else {
                showError(response.message || "Bir hata oluştu.");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Tekrar denemede bir hata oluştu.";
            showError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Kullanıcının durumuna göre gösterilecek içeriği belirler.
     */
    const renderContent = () => {
        // userStatus null ise (daha yüklenmemişse) loading ekranı gösterir.
        if (userStatus === null) {
            return (
                <div className="text-center text-gray-700">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-orange-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Durum Kontrol Ediliyor</h2>
                    <p>Hesabınızın durumu yükleniyor, lütfen bekleyin.</p>
                </div>
            );
        }

        // userStatus değerine göre farklı UI'ları gösterir.
        switch (userStatus) {
            case 'PENDING':
                return (
                    <div className="text-center text-gray-700">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-orange-500 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Hesabınız Onay Bekliyor</h2>
                        <p>Kayıt isteğiniz eğitmeninizin onayına gönderildi. Lütfen sabırla bekleyin.</p>
                        <p className="mt-2">Onaylandığında bilgilendirileceksiniz.</p>
                    </div>
                );
            case 'REJECTED':
                return (
                    <div className="text-center text-gray-700">
                        <FontAwesomeIcon icon={faTimesCircle} className="text-4xl text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Üyelik Reddedildi</h2>
                        <p>Eğitmeniniz üyelik isteğinizi reddetti. Lütfen yeni bir eğitmen telefon numarası girerek tekrar deneyin.</p>
                        <form onSubmit={handleResubmit} className="mt-4 space-y-4">
                            <input
                                type="tel"
                                value={newPtPhoneNumber}
                                onChange={(e) => setNewPtPhoneNumber(e.target.value)}
                                placeholder="Yeni Eğitmen Telefon Numarası"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? (
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                ) : (
                                    'Yeniden İstek Gönder'
                                )}
                            </button>
                        </form>
                    </div>
                );
            case 'APPROVE':
            case 'ADMIN': // Admin rolü için de buraya gelmeyecek çünkü useEffect'te yönlendirilecek
            case 'ACTIVE':
                return null;
            default:
                return (
                    <div className="text-center text-gray-700">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-orange-500 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Durum Kontrol Ediliyor</h2>
                        <p>Hesabınızın durumu yükleniyor, lütfen bekleyin.</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 space-y-6">
                <ErrorDisplay />
                {renderContent()}
            </div>
        </div>
    );
};

export default ApprovalPendingPage;