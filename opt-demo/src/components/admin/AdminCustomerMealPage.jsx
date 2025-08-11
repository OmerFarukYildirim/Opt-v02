import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faTrashAlt, 
    faEdit, 
    faSave, 
    faTimes,
    faUtensils,
} from '@fortawesome/free-solid-svg-icons';

const AdminCustomerMealPage = () => {
    const { customerId } = useParams();
    const [meals, setMeals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [newMealName, setNewMealName] = useState('');
    const [activeMealId, setActiveMealId] = useState(null);
    const [editingMealItemId, setEditingMealItemId] = useState(null);
    // State'i her zaman string değerlerle başlatıyoruz.
    const [editingMealItemData, setEditingMealItemData] = useState({ name: '', description: '', youtubeUrl: '' });

    // Müşteriye ait öğün programlarının hepsini çeken fonksiyon
    const fetchMeals = async () => {
        if (!customerId) return;

        setIsLoading(true);
        setError(null);
        try {
            const ptId = ApiService.getUserId();
            if (!ptId) {
                throw new Error("Personal trainer ID not found.");
            }
            
            const mealRequestDTO = {
                ptId: ptId,
                customerId: customerId,
            };
            
            // Backend'den bir liste döndüğü varsayılarak, veriyi doğrudan setMeals ile kaydediyoruz.
            const response = await ApiService.getOwnMeals(mealRequestDTO);
            console.log("Öğün Programı Listesi:", response.data);
            
            if (response.statusCode === 200) {
                setMeals(response.data);
            } else {
                setMeals([]);
            }
        } catch (err) {
            console.error("Öğün programı çekme hatası:", err);
            setError("Öğün programları getirilemedi.");
            setMeals([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Belirli bir öğün için öğeleri çeken fonksiyon
    const fetchMealItems = async (mealId) => {
        try {
            console.log("Fetching meal items for meal ID:", mealId);
            const response = await ApiService.getMealItemsByMealId(mealId);
            if (response.statusCode === 200) {
                setMeals(prevMeals => prevMeals.map(meal => 
                    meal.id === mealId ? { ...meal, mealItems: response.data } : meal
                ));
            } else {
                toast.error("Öğün detayları getirilirken bir hata oluştu.");
            }
        } catch (err) {
            console.error("Öğün detayı çekme hatası:", err);
            toast.error("Öğün detayları getirilemedi.");
        }
    };

    useEffect(() => {
        // Bu kanca sadece customerId değiştiğinde çalışmalı, çünkü API'miz tarihi kullanmıyor.
        fetchMeals();
    }, [customerId]);

    // Öğün programını genişletip öğün öğelerini gösterme/gizleme
    const toggleMeal = (mealId) => {
        if (activeMealId === mealId) {
            setActiveMealId(null);
        } else {
            setActiveMealId(mealId);
            const meal = meals.find(m => m.id === mealId);
            // Öğün detayları henüz çekilmemişse veya boşsa API'den çek
            if (meal && (!meal.mealItems || meal.mealItems.length === 0)) {
                fetchMealItems(mealId);
            }
        }
    };
    
    // Yeni bir öğün programı ekleme
    const handleCreateMeal = async () => {
        if (!customerId || !selectedDate) {
            toast.error("Müşteri ID'si veya tarih belirtilmemiş.");
            return;
        }
        try {
            const ptId = ApiService.getUserId();
            const mealRequestDTO = {
                ptId,
                customerId,
                date: selectedDate
            };
            const response = await ApiService.createMeal(mealRequestDTO);
            if (response.statusCode === 200) {
                toast.success("Öğün programı başarıyla oluşturuldu.");
                fetchMeals();
            } else {
                toast.error(response.message || "Öğün programı oluşturulurken bir hata oluştu.");
            }
        } catch (err) {
            console.error("Öğün programı oluşturma hatası:", err);
            toast.error("Öğün programı oluşturulurken bir hata oluştu.");
        }
    };

    // Öğün programını silme
    const handleDeleteMeal = async (mealId) => {
        if (window.confirm("Bu öğün programını silmek istediğinizden emin misiniz?")) {
            try {
                const response = await ApiService.deleteMeal(mealId);
                if (response.statusCode === 200) {
                    toast.success("Öğün programı başarıyla silindi.");
                    fetchMeals();
                } else {
                    toast.error(response.message || "Öğün programı silinirken bir hata oluştu.");
                }
            } catch (err) {
                console.error("Öğün programı silme hatası:", err);
                toast.error("Öğün programı silinirken bir hata oluştu.");
            }
        }
    };

    // Yeni öğün öğesi ekleme
    const handleAddMealItem = async (mealId) => {
        if (!newMealName.trim()) {
            toast.warn("Lütfen bir öğün adı girin.");
            return;
        }
        try {
            const mealItemRequestDTO = {
                mealId,
                name: newMealName,
                description: "Örnek açıklama",
                mealTime: "Sabah" // Varsayılan değer
            };
            const response = await ApiService.createMealItem(mealItemRequestDTO);
            if (response.statusCode === 200) {
                toast.success("Öğün öğesi başarıyla eklendi.");
                setNewMealName('');
                fetchMealItems(mealId);
            } else {
                toast.error(response.message || "Öğün öğesi eklenirken bir hata oluştu.");
            }
        } catch (err) {
            console.error("Öğün öğesi ekleme hatası:", err);
            toast.error("Öğün öğesi eklenirken bir hata oluştu.");
        }
    };

    // Öğün öğesi düzenleme
    const handleUpdateMealItem = async (mealId, mealItem) => {
        try {
            const mealItemRequestDTO = {
                ...mealItem,
                name: editingMealItemData.name,
                description: editingMealItemData.description,
                youtubeUrl: editingMealItemData.youtubeUrl
            };
            const response = await ApiService.updateMealItem(mealItemRequestDTO);
            if (response.statusCode === 200) {
                toast.success("Öğün öğesi başarıyla güncellendi.");
                setEditingMealItemId(null);
                setEditingMealItemData({ name: '', description: '', youtubeUrl: '' });
                fetchMealItems(mealId);
            } else {
                toast.error(response.message || "Öğün öğesi güncellenirken bir hata oluştu.");
            }
        } catch (err) {
            console.error("Öğün öğesi güncelleme hatası:", err);
            toast.error("Öğün öğesi güncellenirken bir hata oluştu.");
        }
    };

    // Öğün öğesi silme
    const handleDeleteMealItem = async (mealId, mealItemId) => {
        if (window.confirm("Bu öğün öğesini silmek istediğinizden emin misiniz?")) {
            try {
                const response = await ApiService.deleteMealItem(mealItemId);
                if (response.statusCode === 200) {
                    toast.success("Öğün öğesi başarıyla silindi.");
                    fetchMealItems(mealId);
                } else {
                    toast.error(response.message || "Öğün öğesi silinirken bir hata oluştu.");
                }
            } catch (err) {
                console.error("Öğün öğesi silme hatası:", err);
                toast.error("Öğün öğesi silinirken bir hata oluştu.");
            }
        }
    };

    // **Bu fonksiyon güncellendi**
    const handleEditClick = (mealItem) => {
        setEditingMealItemId(mealItem.id);
        setEditingMealItemData({
            name: mealItem.name || '',          // null/undefined durumuna karşı koruma
            description: mealItem.description || '', // null/undefined durumuna karşı koruma
            youtubeUrl: mealItem.youtubeUrl || ''    // null/undefined durumuna karşı koruma
        });
    };

    // Filter meals by selected date
    const filteredMeals = meals.filter(meal => meal.date === selectedDate);


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Öğün Programı Yönetimi</h1>
            
            <div className="flex items-center space-x-4 mb-6">
                <label htmlFor="date-picker" className="text-gray-700 font-medium">Tarih Seçin:</label>
                <input
                    id="date-picker"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-gray-500">Öğün programı yükleniyor...</div>
            ) : error ? (
                <div className="text-center text-red-500 font-medium">{error}</div>
            ) : filteredMeals.length > 0 ? (
                <div className="space-y-6">
                    {filteredMeals.map(meal => (
                        <div key={meal.id} className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleMeal(meal.id)}>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Öğün Programı - Tarih: {meal.date}
                                    </h2>
                                    <p className="text-gray-600">
                                        Oluşturan (PT ID): <span className="font-semibold">{meal.ptId}</span>
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteMeal(meal.id); }}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title="Öğün Programını Sil"
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </div>
                            </div>

                            {activeMealId === meal.id && (
                                <div className="mt-6 border-t pt-6">
                                    <h3 className="text-lg font-bold text-gray-700 mb-4">Öğün Detayları</h3>
                                    
                                    <div className="space-y-4 mb-6">
                                        {meal.mealItems && meal.mealItems.length > 0 ? (
                                            meal.mealItems.map(item => (
                                                <div key={item.id} className="bg-gray-100 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                                    {editingMealItemId === item.id ? (
                                                        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                                            <div className="flex flex-col">
                                                                <label className="text-sm text-gray-600">Öğün Adı</label>
                                                                <input
                                                                    className="p-2 border rounded-md"
                                                                    value={editingMealItemData.name}
                                                                    onChange={(e) => setEditingMealItemData({ ...editingMealItemData, name: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <label className="text-sm text-gray-600">Açıklama</label>
                                                                <input
                                                                    className="p-2 border rounded-md"
                                                                    value={editingMealItemData.description}
                                                                    onChange={(e) => setEditingMealItemData({ ...editingMealItemData, description: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <label className="text-sm text-gray-600">YouTube URL</label>
                                                                <input
                                                                    className="p-2 border rounded-md"
                                                                    value={editingMealItemData.youtubeUrl}
                                                                    onChange={(e) => setEditingMealItemData({ ...editingMealItemData, youtubeUrl: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex-grow pr-4">
                                                            <h4 className="font-semibold text-gray-800 flex items-center">
                                                                <FontAwesomeIcon icon={faUtensils} className="mr-2 text-orange-500" />
                                                                {item.name}
                                                            </h4>
                                                            <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                                                            {item.youtubeUrl && (
                                                                <a href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm hover:underline mt-1 block">YouTube Videosu</a>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex-shrink-0 space-x-2 mt-4 sm:mt-0">
                                                        {editingMealItemId === item.id ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateMealItem(meal.id, item)}
                                                                    className="text-green-500 hover:text-green-700 transition-colors"
                                                                    title="Kaydet"
                                                                >
                                                                    <FontAwesomeIcon icon={faSave} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingMealItemId(null)}
                                                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                                                    title="İptal"
                                                                >
                                                                    <FontAwesomeIcon icon={faTimes} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleEditClick(item)}
                                                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                                                title="Düzenle"
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteMealItem(meal.id, item.id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors"
                                                            title="Sil"
                                                        >
                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-500 text-center py-4">Bu program için henüz öğün detayı bulunmuyor.</div>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <input
                                            value={newMealName}
                                            onChange={(e) => setNewMealName(e.target.value)}
                                            className="flex-grow p-3 border border-gray-300 rounded-lg"
                                            placeholder="Yeni öğün adı ekle (örn: Akşam Yemeği)..."
                                        />
                                        <button
                                            onClick={() => handleAddMealItem(meal.id)}
                                            className="p-3 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                                            title="Öğün Öğesi Ekle"
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    <p>Seçilen tarih için hiç öğün programı bulunamadı.</p>
                    <button
                        onClick={handleCreateMeal}
                        className="mt-4 p-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        <span>Bu tarih için yeni öğün programı oluştur</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminCustomerMealPage;
