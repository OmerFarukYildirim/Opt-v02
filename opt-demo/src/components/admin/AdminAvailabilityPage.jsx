// src/components/admin/AdminAvailabilityPage.jsx

import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashAlt, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminAvailabilityPage = () => {
    const [availabilities, setAvailabilities] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [newAvailability, setNewAvailability] = useState({
        ptId: ApiService.getUserId(), // PT ID'sini otomatik olarak alıyoruz
        date: '',
        startTime: '',
        endTime: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    // Takvimdeki günleri oluşturmak için yardımcı fonksiyon
    const getWeekDays = (startDate) => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const daysOfWeek = getWeekDays(new Date());

    // Müsaitlikleri API'den çeken fonksiyon
    const fetchAvailabilities = async (date) => {
        setIsLoading(true);
        try {
            const currentUser = await ApiService.myProfile();
                        const ptId = currentUser.data.ptId;
            
                        if (!currentUser || !ptId) {
                            setLoading(false);
                            setError("Kullanıcı veya PT bilgileri eksik, lütfen tekrar giriş yapın.");
                            return;
                        }
            
                        const dateString = date.toISOString().split('T')[0];
                        const availabilityRequestDTO = {
                            ptId: ptId,
                            date: dateString
                        };
            
                        const response = await ApiService.getAvailabilitiesByDate(availabilityRequestDTO);
            if (response.statusCode === 200) {
                console.log("Müsaitlikler:", response.data);
                setAvailabilities(response.data);
            } else {
                setAvailabilities([]);
            }
        } catch (error) {
            setAvailabilities([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailabilities(selectedDate);
    }, [selectedDate]);

    // Form inputlarını güncelleyen fonksiyon
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAvailability(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Yeni müsaitlik ekleme fonksiyonu
    const handleAddAvailability = async (e) => {
        e.preventDefault();
        try {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            const dataToSend = {
                ...newAvailability,
                date: formattedDate,
                ptId: ApiService.getUserId()
            };
            await ApiService.createAvailability(dataToSend);
            toast.success("Müsaitlik başarıyla eklendi!");
            await fetchAvailabilities(selectedDate); // Listeyi yenile
            setNewAvailability({ ...newAvailability, startTime: '', endTime: '' }); // Formu sıfırla
        } catch (error) {
            console.error("Müsaitlik eklenirken hata oluştu:", error);
            toast.error("Müsaitlik eklenirken bir hata oluştu.");
        }
    };

    // Müsaitlik silme fonksiyonu
    const handleDeleteAvailability = async (id) => {
        try {
            await ApiService.deleteAvailability(id);
            toast.success("Müsaitlik başarıyla silindi.");
            await fetchAvailabilities(selectedDate);
        } catch (error) {
            console.error("Müsaitlik silinirken hata oluştu:", error);
            toast.error("Müsaitlik silinirken bir hata oluştu.");
        }
    };

    // Müsaitlik durumunu değiştirme fonksiyonu
    const handleToggleAccessible = async (id, currentStatus) => {
        try {
            if (currentStatus) {
                await ApiService.makeAccessableFalse(id);
                toast.success("Müsaitlik randevulara kapatıldı.");
            } else {
                await ApiService.makeAccessableTrue(id);
                toast.success("Müsaitlik randevulara açıldı.");
            }
            await fetchAvailabilities(selectedDate);
        } catch (error) {
            console.error("Müsaitlik durumu güncellenirken hata oluştu:", error);
            toast.error("Durum güncellenirken bir hata oluştu.");
        }
    };

    // Görüntüleme için gün isimlerini ve tarih formatını alma
    const getFormattedDate = (date) => {
        const options = { weekday: 'long', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('tr-TR', options);
    };

    const getWeekdayName = (date) => {
        const options = { weekday: 'long' };
        return date.toLocaleDateString('tr-TR', options);
    };

    const getShortDate = (date) => {
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    };

    // Saatleri 09:00 - 18:00 arasında 30 dakikalık aralıklarla oluşturan fonksiyon
    const generateTimeSlots = () => {
        const slots = [];
        for (let h = 9; h <= 18; h++) {
            for (let m = 0; m < 60; m += 30) {
                const hour = String(h).padStart(2, '0');
                const minute = String(m).padStart(2, '0');
                slots.push(`${hour}:${minute}`);
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Müsaitlik Yönetimi</h1>
            
            {/* Takvim ve Tarih Seçimi */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-center mb-4">
                    {/* Haftalık navigasyon butonu */}
                </div>
                <div className="flex justify-between space-x-2 overflow-x-auto">
                    {daysOfWeek.map((day, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedDate(day)}
                            className={`flex flex-col items-center p-4 rounded-lg flex-grow transition-colors duration-200 
                                ${selectedDate.toDateString() === day.toDateString()
                                    ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                                    : 'bg-gray-200 text-gray-700 hover:bg-orange-100 hover:text-orange-600'
                                }`}
                        >
                            <span className="font-semibold text-lg">{getWeekdayName(day).split(' ')[0]}</span>
                            <span className="text-sm">{getShortDate(day)}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:space-x-6">
                
                {/* Müsaitlik Ekleme Formu */}
                <div className="flex-1 bg-white p-6 rounded-lg shadow-md mb-6 lg:mb-0">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Yeni Müsaitlik Ekle</h2>
                    <p className="text-sm text-gray-500 mb-4">Seçilen tarih: <span className="font-semibold text-orange-600">{getFormattedDate(selectedDate)}</span></p>
                    <form onSubmit={handleAddAvailability} className="space-y-4">
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Başlangıç Saati</label>
                            <select
                                id="startTime"
                                name="startTime"
                                value={newAvailability.startTime}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                required
                            >
                                <option value="">Saat Seçin</option>
                                {timeSlots.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Bitiş Saati</label>
                            <select
                                id="endTime"
                                name="endTime"
                                value={newAvailability.endTime}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                required
                            >
                                <option value="">Saat Seçin</option>
                                {timeSlots.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Müsaitlik Ekle
                        </button>
                    </form>
                </div>

                {/* Mevcut Müsaitlik Listesi */}
                <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Mevcut Müsaitlikler</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Seçilen tarih için: <span className="font-semibold text-orange-600">{getFormattedDate(selectedDate)}</span>
                    </p>
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
                    ) : availabilities.length > 0 ? (
                        <ul className="space-y-3">
                            {availabilities.map(av => (
                                <li key={av.id} className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-200 
                                    ${av.accessible ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${av.accessible ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span>{av.startTime} - {av.endTime}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        {av.accessible ? (
                                            <button
                                                onClick={() => handleToggleAccessible(av.id, av.accessible)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                                title="Randevuya Kapat"
                                            >
                                                <FontAwesomeIcon icon={faTimesCircle} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleToggleAccessible(av.id, av.accessible)}
                                                className="text-green-500 hover:text-green-700 transition-colors"
                                                title="Randevuya Aç"
                                            >
                                                <FontAwesomeIcon icon={faCheckCircle} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteAvailability(av.id)}
                                            className="text-gray-500 hover:text-gray-700 transition-colors"
                                            title="Sil"
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 text-gray-500">Bu tarihte müsaitlik bulunamadı.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAvailabilityPage;
