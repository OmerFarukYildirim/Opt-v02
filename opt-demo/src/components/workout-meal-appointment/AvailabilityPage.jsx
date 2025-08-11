// src/components/availability/AvailabilityPage.jsx
import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft, faClipboardList, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const AvailabilityPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availabilities, setAvailabilities] = useState(null);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [customerNames, setCustomerNames] = useState({});
    const [appointmentNotes, setAppointmentNotes] = useState(null);
    const [notesLoading, setNotesLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    // YENİ STATE: Randevu ID'sine karşılık gelen müşteri ID'sini tutar
    const [bookedAppointmentCustomerIds, setBookedAppointmentCustomerIds] = useState({});

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

    const getAvailabilityData = async (date) => {
        setLoading(true);
        setError('');
        setAvailabilities(null);
        setCustomerNames({});
        setSelectedAppointmentId(null);
        setBookedAppointmentCustomerIds({}); // Yeni state'i sıfırlayın

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
            setCurrentUserId(currentUser.data.id);
            console.log("Current User ID:", currentUser.data.id);

            if (response.statusCode === 200) {
                const sortedAvailabilities = response.data.sort((a, b) => {
                    const timeA = new Date(`1970/01/01 ${a.startTime}`);
                    const timeB = new Date(`1970/01/01 ${b.startTime}`);
                    return timeA - timeB;
                });
                setAvailabilities(sortedAvailabilities);
            } else {
                setAvailabilities(null);
            }
        } catch (err) {
            console.error("API hatası:", err);
            setAvailabilities(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const currentUser = await ApiService.myProfile();
            if (currentUser.data) {
                getAvailabilityData(selectedDate);
            } else {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedDate]);

    // Randevuların customerId ve customerNames bilgilerini çekmek için yeni useEffect
    useEffect(() => {
        if (availabilities) {
            const fetchBookedAppointmentData = async () => {
                const names = {};
                const customerIds = {};
                for (const availability of availabilities) {
                    if (!availability.accessible && availability.status === 'BOOKED') {
                        try {
                            const appointmentResponse = await ApiService.getAppointmentByDateAndStartTime(availability.date, availability.startTime);
                            if (appointmentResponse.statusCode === 200 && appointmentResponse.data) {
                                const customerId = appointmentResponse.data.customerId;
                                customerIds[availability.id] = customerId; // Yeni state için customerId'yi kaydet
                                
                                const userResponse = await ApiService.getUserProfileById(customerId);
                                if (userResponse.statusCode === 200) {
                                    names[customerId] = userResponse.data.name;
                                } else {
                                    names[customerId] = 'Bilinmiyor';
                                }
                            }
                        } catch (err) {
                            console.error(`Müşteri veya randevu bilgisi çekilemedi:`, err);
                            names[availability.customerId] = 'Bilinmiyor';
                        }
                    }
                }
                setCustomerNames(names);
                setBookedAppointmentCustomerIds(customerIds); // Yeni state'i güncelle
            };
            fetchBookedAppointmentData();
        }
    }, [availabilities]);

    const fetchAppointmentNotes = async (appointmentId) => {
        setNotesLoading(true);
        setAppointmentNotes(null);
        console.log("Randevu ID:", appointmentId);
        try {
            const response = await ApiService.getAppointmentNotesByAppointmentId(appointmentId);

            if (response.statusCode === 200) {
                setAppointmentNotes(response.data);
                if (response.data && response.data.length > 0) {
                    console.log("Notlar başarıyla çekildi:", response.data);
                } else {
                    console.log("Bu randevu için not bulunamadı.");
                }
            } 
        } catch (err) {
            console.error("Randevu notları çekme hatası:", err);
            setAppointmentNotes([]);
        } finally {
            setNotesLoading(false);
        }
    };


    const handleAvailabilityClick = async (availability) => {
        if (!availability.accessible && availability.status !== 'CANCELLED') {
            const dateString = new Date(availability.date).toISOString().split('T')[0];
            const appointmentResponse = await ApiService.getAppointmentByDateAndStartTime(dateString, availability.startTime);

            if (appointmentResponse.statusCode === 200 && appointmentResponse.data) {
                const appointmentId = appointmentResponse.data.id;

                if (selectedAppointmentId === availability.id) {
                    setSelectedAppointmentId(null);
                    setAppointmentNotes(null);
                    setSelectedAppointmentDetails(null);
                } else {
                    setSelectedAppointmentId(availability.id);
                    fetchAppointmentNotes(appointmentId);
                    setSelectedAppointmentDetails(appointmentResponse.data);
                }
            } else {
                alert("Randevu bilgisi bulunamadı.");
            }
        }
    };

    const handleBookAppointment = async (availability) => {
        setLoading(true);
        try {
            const currentUser = await ApiService.myProfile();
            const customerId = currentUser.data.id;
            const ptId = availability.ptId;

            const appointmentRequestDTO = {
                ptId: ptId,
                customerId: customerId,
                availabilityId: availability.id,
                date: availability.date,
                startTime: availability.startTime,
                endTime: availability.endTime,
                videoCallUrl: "https://us05web.zoom.us/j/88659380131?pwd=fWhNksn2gRMbgJh1IPMjkcF7DuglAg.1"
            };

            const response = await ApiService.createAppointment(appointmentRequestDTO);
            if (response.statusCode === 200) {
                const updateResponse = await ApiService.makeAccessableFalse(availability.id);

                if (updateResponse.statusCode === 200) {
                    alert("Randevunuz başarıyla oluşturuldu ve müsaitlik durumu güncellendi!");
                    getAvailabilityData(selectedDate);
                    setSelectedAppointmentId(null);
                } else {
                    alert("Randevu oluşturuldu ancak müsaitlik durumu güncellenemedi. Lütfen yöneticinize danışın.");
                }
            } else {
                alert("Randevu alınırken bir hata oluştu: " + response.message);
            }
        } catch (err) {
            console.error("Randevu alma hatası:", err);
            alert("Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async (availability) => {
        if (!window.confirm("Bu randevuyu iptal etmek istediğinizden emin misiniz?")) {
            return;
        }

        setLoading(true);
        try {
            const appointmentResponse = await ApiService.getAppointmentByDateAndStartTime(availability.date, availability.startTime);
            if (appointmentResponse.statusCode !== 200 || !appointmentResponse.data) {
                alert("Randevu bilgisi bulunamadı.");
                setLoading(false);
                return;
            }

            const appointmentId = appointmentResponse.data.id;
            const response = await ApiService.cancelAppointment(appointmentId);

            if (response.statusCode === 200) {
                alert("Randevu başarıyla iptal edildi.");
                getAvailabilityData(selectedDate);
                setSelectedAppointmentId(null);
            } else {
                alert("Randevu iptal edilirken bir hata oluştu: " + response.message);
            }
        } catch (err) {
            console.error("Randevu iptal hatası:", err);
            alert("Randevu iptal edilirken beklenmedik bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }

    const dates = getDatesForWeek(selectedDate);

    const goToNextWeek = () => {
        const nextWeek = new Date(selectedDate);
        nextWeek.setDate(nextWeek.getDate() + 7);
        setSelectedDate(nextWeek);
        setSelectedAppointmentId(null);
    };

    const goToPrevWeek = () => {
        const prevWeek = new Date(selectedDate);
        prevWeek.setDate(prevWeek.getDate() - 7);
        setSelectedDate(prevWeek);
        setSelectedAppointmentId(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
                Müsait Randevular
            </h1>

            <p className="text-lg text-gray-600 text-center mb-6">
                {formatMonthYear(selectedDate)}
            </p>

            <div className="bg-white rounded-lg shadow-md mb-8 p-4 flex items-center justify-between">
                <button onClick={goToPrevWeek} className="p-2 text-gray-600 hover:text-orange-500 transition-colors">
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <div className="flex-1 overflow-x-auto whitespace-nowrap hide-scrollbar">
                    {dates.map((date, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setSelectedDate(date);
                                setSelectedAppointmentId(null);
                            }}
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

            <div className="max-w-4xl mx-auto">
                {loading ? (
                    <div className="text-center text-gray-500">Yükleniyor...</div>
                ) : !availabilities || availabilities.length === 0 ? (
                    <div className="text-center text-gray-500 p-6 bg-white rounded-lg shadow-md">
                        <p className="text-lg font-semibold">Bu tarihte müsait randevu bulunmamaktadır.</p>
                        <p className="text-sm text-gray-400 mt-2">Lütfen başka bir tarih seçin.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {availabilities.map((availability) => (
                            <div
                                key={availability.id}
                                className={`p-4 rounded-lg shadow-md transition-colors
                                    ${availability.accessible
                                        ? 'bg-green-100 hover:bg-green-200'
                                        : availability.status === 'CANCELLED'
                                            ? 'bg-pink-100'
                                            : 'bg-red-100'
                                    }
                                    ${selectedAppointmentId === availability.id ? 'ring-2 ring-orange-500' : ''}
                                `}
                            >
                                <div className="w-full text-left flex justify-between items-center">
                                    <div className="flex-1">
                                        <p className="font-bold text-lg">{availability.startTime} - {availability.endTime}</p>
                                        {!availability.accessible && availability.status === 'BOOKED' && (
                                            <p className="text-red-500 text-sm font-semibold">
                                                {customerNames[bookedAppointmentCustomerIds[availability.id]] || '...'} tarafından alındı
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {availability.accessible ? (
                                            <button
                                                onClick={() => handleBookAppointment(availability)}
                                                className="bg-orange-500 text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-orange-600 transition-colors"
                                            >
                                                Randevu Al
                                            </button>
                                        ) : availability.status === 'CANCELLED' ? (
                                            <p className="text-sm font-semibold italic whitespace-nowrap">İptal edilen randevu tekrar alınamaz</p>
                                        ) : (
                                            <>
                                                {/* İptal butonunun koşulunu güncelledik */}
                                                {bookedAppointmentCustomerIds[availability.id] === currentUserId && (
                                                    <button
                                                        onClick={() => handleCancelAppointment(availability)}
                                                        className="bg-red-500 text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-red-600 transition-colors"
                                                    >
                                                        İptal Et
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleAvailabilityClick(availability)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    <FontAwesomeIcon icon={selectedAppointmentId === availability.id ? faTimesCircle : faClipboardList} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {selectedAppointmentId === availability.id && (
                                    <div className="mt-4 bg-gray-50 p-4 rounded-md">
                                        <h3 className="font-bold text-lg mb-2">Randevu Notları</h3>
                                        {selectedAppointmentDetails && selectedAppointmentDetails.videoCallUrl && (
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-gray-700">Video Görüşme Linki:</p>
                                                <a
                                                    href={selectedAppointmentDetails.videoCallUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline text-sm"
                                                >
                                                    {selectedAppointmentDetails.videoCallUrl}
                                                </a>
                                            </div>
                                        )}
                                        {notesLoading ? (
                                            <p className="text-gray-500">Notlar yükleniyor...</p>
                                        ) : appointmentNotes && appointmentNotes.length > 0 ? (
                                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                                {appointmentNotes.map(note => (
                                                    <li key={note.id}>
                                                        <p className="text-sm">{note.noteText}</p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {new Date(note.createdAt).toLocaleString('tr-TR')}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500">Bu randevu için henüz not eklenmemiş.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvailabilityPage;