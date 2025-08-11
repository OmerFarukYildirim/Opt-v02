import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSpinner, faCalendarAlt, faDrumstickBite, faDumbbell } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';

const AdminCustomerApprovalPage = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await ApiService.getCustomersByPtId();
                
                if (response.statusCode === 200 && response.data) {
                    setCustomers(response.data);
                } else {
                    setError(response.message || 'Müşteri listesi alınamadı.');
                }
            } catch (err) {
                console.error("Müşteri listesi çekilirken hata oluştu:", err);
                setError('Müşteri listesi alınırken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    // Bu fonksiyonu kaldırıyoruz, çünkü müşteri kartına doğrudan link vereceğiz.
    // const handleSelectCustomer = (customerId) => {
    //     // Artık doğrudan randevu sayfasına yönlendireceğiz.
    //     navigate(`/admin/home/customer/${customerId}/appointments`);
    // };

    // Yeni eklenen fonksiyon: Müşteriyi onaylama
    const handleApproveCustomer = async (customerId) => {
        setLoading(true); // Yükleme durumunu göster
        try {
            await ApiService.setUserStatus(customerId, 'APPROVE');
            
            // Başarılı olursa, müşteri listesini yeniden çek
            const response = await ApiService.getCustomersByPtId();
            if (response.statusCode === 200 && response.data) {
                setCustomers(response.data);
            }
        } catch (err) {
            console.error("Müşteri onaylanırken hata oluştu:", err);
            setError('Müşteriyi onaylama sırasında bir hata oluştu.');
        } finally {
            setLoading(false); // Yükleme durumunu kapat
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <FontAwesomeIcon icon={faSpinner} spin className="text-orange-500 text-4xl" />
                <p className="ml-4 text-gray-700">Müşteriler yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-red-500 font-bold">{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Müşteri Listesi ve Onaylama</h1>
            <p className="text-center text-gray-600 mb-8">
                Müşterilerinizi yönetin ve onaylayın.
            </p>

            {customers.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">Kayıtlı müşteriniz bulunmamaktadır.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customers.map((customer) => (
                        <div
                            key={customer.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    <FontAwesomeIcon icon={faUser} className="text-orange-500 text-3xl" />
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{customer.name}</h2>
                                        <p className="text-sm text-gray-500">{customer.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>Durum:</span>
                                    <span className={`font-semibold ${customer.status === 'PENDING' ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {customer.status === 'PENDING' ? 'Onay Bekliyor' : 'Onaylandı'}
                                    </span>
                                </div>
                                {/* 'PENDING' durumundaki müşteriler için Onayla butonu */}
                                {customer.status === 'PENDING' ? (
                                    <div className="mt-4">
                                        <button
                                            onClick={() => handleApproveCustomer(customer.id)}
                                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            Onayla
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex justify-between space-x-2">
                                        <NavLink
                                            to={`/admin/home/customer/${customer.id}/appointments`}
                                            className="w-1/3 flex justify-center items-center py-2 px-2 border rounded-md shadow-sm text-sm font-medium text-orange-600 bg-white hover:bg-gray-100 transition-colors"
                                            title="Randevuları Görüntüle"
                                        >
                                            <FontAwesomeIcon icon={faCalendarAlt} />
                                        </NavLink>
                                        <NavLink
                                            to={`/admin/home/customer/${customer.id}/meals`}
                                            className="w-1/3 flex justify-center items-center py-2 px-2 border rounded-md shadow-sm text-sm font-medium text-orange-600 bg-white hover:bg-gray-100 transition-colors"
                                            title="Öğün Programını Görüntüle"
                                        >
                                            <FontAwesomeIcon icon={faDrumstickBite} />
                                        </NavLink>
                                        <NavLink
                                            to={`/admin/home/customer/${customer.id}/workouts`}
                                            className="w-1/3 flex justify-center items-center py-2 px-2 border rounded-md shadow-sm text-sm font-medium text-orange-600 bg-white hover:bg-gray-100 transition-colors"
                                            title="Spor Programını Görüntüle"
                                        >
                                            <FontAwesomeIcon icon={faDumbbell} />
                                        </NavLink>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCustomerApprovalPage;
