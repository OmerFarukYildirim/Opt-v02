import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft, faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';

const MealPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [meal, setMeal] = useState(null); // Tek bir meal objesi tutacak
    const [openMealItemId, setOpenMealItemId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const formatDate = (date) => {
        const options = { weekday: 'short', day: 'numeric' };
        return date.toLocaleDateString('tr-TR', options);
    };

    const formatMonthYear = (date) => {
        const options = { year: 'numeric', month: 'long' };
        return date.toLocaleDateString('tr-TR', options);
    };

    const getDatesForWeek = (startDate) => {
        const dates = [];
        const startOfWeek = new Date(startDate);
        startOfWeek.setDate(startDate.getDate() - startDate.getDay() + (startDate.getDay() === 0 ? -6 : 1));
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const getMealData = async (date) => {
        setLoading(true);
        setError('');
        
        try {
            const currentUser = await ApiService.myProfile();
            const userId = currentUser.data.id; 

            if (!currentUser || !userId || !currentUser.data.ptId) {
                setLoading(false);
                setError("Kullanıcı bilgileri eksik, lütfen tekrar giriş yapın.");
                return;
            }

            const dateString = date.toISOString().split('T')[0];
            const mealRequestDTO = {
                customerId: userId,
                ptId: currentUser.data.ptId,
                date: dateString
            };

            // API çağrısını Meal servisi ile değiştirin
            const response = await ApiService.getOwnMeal(mealRequestDTO);
            
            if (response.statusCode === 200) {
                 setMeal(response.data);
            } else {
                 setMeal(null);
            }
        } catch (err) {

                 setMeal(null);
           
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        const fetchData = async () => {
            const currentUser = await ApiService.myProfile(); 
            if (currentUser.data) {
                getMealData(selectedDate);
            } else {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedDate]);

    const dates = getDatesForWeek(selectedDate);

    const goToNextWeek = () => {
        const nextWeek = new Date(selectedDate);
        nextWeek.setDate(nextWeek.getDate() + 7);
        setSelectedDate(nextWeek);
    };
    
    const goToPrevWeek = () => {
        const prevWeek = new Date(selectedDate);
        prevWeek.setDate(prevWeek.getDate() - 7);
        setSelectedDate(prevWeek);
    };

    const toggleMealItemDetails = (id) => {
        setOpenMealItemId(openMealItemId === id ? null : id);
    };
    
    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
                Öğün Programım
            </h1>
            
            <p className="text-lg text-gray-600 text-center mb-6">
                {formatMonthYear(selectedDate)}
            </p>

            {/* Tarih Seçim Çubuğu */}
            <div className="bg-white rounded-lg shadow-md mb-8 p-4 flex items-center justify-between">
                <button onClick={goToPrevWeek} className="p-2 text-gray-600 hover:text-orange-500 transition-colors">
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <div className="flex-1 overflow-x-auto whitespace-nowrap hide-scrollbar">
                    {dates.map((date, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedDate(date)}
                            className={`p-2 mx-1 inline-block transition-colors rounded-full
                                ${date.toDateString() === selectedDate.toDateString()
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {formatDate(date)}
                        </button>
                    ))}
                </div>
                <button onClick={goToNextWeek} className="p-2 text-gray-600 hover:text-orange-500 transition-colors">
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>

            {/* Öğün Programı Listesi */}
            <div className="max-w-4xl mx-auto">
                {loading ? (
                    <div className="text-center text-gray-500">Yükleniyor...</div>
                ) : !meal || (meal.mealItems && meal.mealItems.length === 0) ? (
                    <div className="text-center text-gray-500 p-6 bg-white rounded-lg shadow-md">
                        <p className="text-lg font-semibold">Bu tarihe ait öğün programınız bulunmamaktadır.</p>
                        <p className="text-sm text-gray-400 mt-2">Lütfen başka bir tarih seçin.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Meal objesinin kendisi için bir başlık yok, doğrudan öğünleri listeliyoruz */}
                            <div className="p-4 border-t border-gray-200">
                                <h4 className="text-md font-semibold text-gray-700 mb-2">Öğünler:</h4>
                                <ul className="space-y-2">
                                    {meal.mealItems.map(mealItem => (
                                        <li key={mealItem.id} className="border border-gray-200 rounded-md">
                                            <button 
                                                onClick={() => toggleMealItemDetails(mealItem.id)} 
                                                className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="text-left">
                                                  <span className="font-medium block">{mealItem.name}</span>
                                                  <span className="text-sm text-gray-500">{mealItem.mealTime}</span>
                                                </div>
                                                <FontAwesomeIcon 
                                                    icon={openMealItemId === mealItem.id ? faArrowUp : faArrowDown} 
                                                    className="text-gray-400" 
                                                />
                                            </button>
                                            
                                            {openMealItemId === mealItem.id && (
                                                <div className="p-3 bg-gray-100 text-sm text-gray-600">
                                                    <p><strong>Açıklama:</strong> {mealItem.description}</p>
                                                    {mealItem.youtubeUrl && (
                                                        <p>
                                                            <strong>Video:</strong> <a href={mealItem.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">İzle</a>
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MealPage;