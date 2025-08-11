// src/components/admin/AdminSelectCustomerPage.jsx
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const AdminSelectCustomerPage = () => {
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Müşteri listesini çeken fonksiyon
    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            // Gerçek API'den müşteri listesi çekme
            // Not: Bu endpoint'in API'de var olduğunu varsayıyorum.
            // Yoksa, bu kısmı kendi uygulamanıza göre düzenlemelisiniz.
            const response = await ApiService.getAllCustomers();
            if (response.statusCode === 200) {
                setCustomers(response.data);
                console.log("Müşteri listesi:", response.data);
            } else {
                setCustomers([]);
            }
        } catch (err) {
            setError("Müşteri listesi getirilirken bir hata oluştu.");
            setCustomers([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Müşteri Seçimi</h1>

            {isLoading ? (
                <div className="text-center py-10 text-gray-500">Müşteriler yükleniyor...</div>
            ) : error ? (
                <div className="text-center text-red-500 font-medium">{error}</div>
            ) : customers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customers.map(customer => (
                        <div key={customer.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{customer.name}</h2>
                                <p className="text-gray-600 mt-2">Email: {customer.email}</p>
                                <p className="text-gray-600">ID: {customer.id}</p>
                            </div>
                            <div className="mt-4">
                                <NavLink
                                    to={`customer/${customer.id}/appointments`}
                                    className="inline-flex items-center justify-center w-full py-2 px-4 rounded-lg font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-colors duration-200"
                                >
                                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                                    <span>Randevuları Görüntüle</span>
                                </NavLink>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">Hiç müşteri bulunamadı.</div>
            )}
        </div>
    );
};

export default AdminSelectCustomerPage;
