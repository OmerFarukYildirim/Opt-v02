// src/components/admin/AdminAppointmentPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashAlt, faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const AdminAppointmentPage = () => {
    const { customerId } = useParams();
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeAppointmentId, setActiveAppointmentId] = useState(null);
    const [newNoteText, setNewNoteText] = useState('');
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editingNoteText, setEditingNoteText] = useState('');

    // Müşteriye ait tüm randevuları çeken fonksiyon
    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const response = await ApiService.getAppointmentsByCustomerId(customerId);
             console.log("Randevular:", response.data);
            if (response.statusCode === 200) {
                const sortedAppointments = response.data.sort((a, b) => {
                    const timeA = new Date(`1970/01/01 ${a.startTime}`);
                    const timeB = new Date(`1970/01/01 ${b.startTime}`);
                    return timeA - timeB;
                });
                setAppointments(sortedAppointments);
            } else {
                setAppointments([]);
            }
        } catch (err) {
            setAppointments([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Bir randevuya ait notları çeken fonksiyon
    const fetchAppointmentNotes = async (appointmentId) => {
        try {
            const response = await ApiService.getAppointmentNotesByAppointmentId(appointmentId);
            if (response.statusCode === 200) {
                // Notları ilgili randevuya ekliyoruz
                setAppointments(prevAppointments => prevAppointments.map(app => 
                    app.id === appointmentId ? { ...app, notes: response.data } : app
                ));
            } else {
                toast.error("Randevu notları getirilirken bir hata oluştu.");
            }
        } catch (err) {
            console.error("Not çekme hatası:", err);
            toast.error("Notlar getirilemedi.");
        }
    };

    useEffect(() => {
        if (customerId) {
            fetchAppointments();
        }
    }, [customerId]);

    // Randevuyu genişletip notlarını gösterme/gizleme
    const toggleAppointment = (appointmentId) => {
        if (activeAppointmentId === appointmentId) {
            setActiveAppointmentId(null);
        } else {
            setActiveAppointmentId(appointmentId);
            // Sadece açıldığında notları çek
            const appointment = appointments.find(app => app.id === appointmentId);
            if (appointment && !appointment.notes) {
                fetchAppointmentNotes(appointmentId);
            }
        }
    };

    // Yeni not ekleme
    const handleAddNote = async (appointmentId) => {
        if (!newNoteText.trim()) {
            toast.warn("Lütfen bir not yazın.");
            return;
        }
        try {
            const appointmentNoteRequestDTO = {
                appointmentId,
                noteText: newNoteText
            };
            const response = await ApiService.createAppointmentNote(appointmentNoteRequestDTO);
            if (response.statusCode === 200) {
                toast.success("Not başarıyla eklendi.");
                setNewNoteText('');
                fetchAppointmentNotes(appointmentId); // Notları yenile
            } else {
                toast.error(response.message || "Not eklenirken bir hata oluştu.");
            }
        } catch (err) {
            console.error("Not ekleme hatası:", err);
            toast.error("Not eklenirken bir hata oluştu.");
        }
    };

    // Not silme
    const handleDeleteNote = async (appointmentId, noteId) => {
        try {
            const response = await ApiService.deleteAppointmentNote(noteId);
            if (response.statusCode === 200) {
                toast.success("Not başarıyla silindi.");
                fetchAppointmentNotes(appointmentId); // Notları yenile
            } else {
                toast.error(response.message || "Not silinirken bir hata oluştu.");
            }
        } catch (err) {
            console.error("Not silme hatası:", err);
            toast.error("Not silinirken bir hata oluştu.");
        }
    };
    
    // Notu güncelleme
    const handleUpdateNote = async (appointmentId, noteId) => {
        if (!editingNoteText.trim()) {
            toast.warn("Lütfen notu boş bırakmayın.");
            return;
        }
        try {
            const appointmentNoteRequestDTO = {
                id: noteId,
                noteText: editingNoteText
            };
            const response = await ApiService.updateAppointmentNote(appointmentNoteRequestDTO);
            if (response.statusCode === 200) {
                toast.success("Not başarıyla güncellendi.");
                setEditingNoteId(null); // Düzenleme modundan çık
                setEditingNoteText('');
                fetchAppointmentNotes(appointmentId); // Notları yenile
            } else {
                toast.error(response.message || "Not güncellenirken bir hata oluştu.");
            }
        } catch (err) {
            console.error("Not güncelleme hatası:", err);
            toast.error("Not güncellenirken bir hata oluştu.");
        }
    };

    // Randevuyu iptal etme
    const handleCancelAppointment = async (appointmentId) => {
        if(window.confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) {
            try {
                const response = await ApiService.cancelAppointment(appointmentId);
                if (response.statusCode === 200) {
                    toast.success("Randevu başarıyla iptal edildi.");
                    fetchAppointments(); // Listeyi yenile
                } else {
                    toast.error(response.message || "Randevu iptal edilirken bir hata oluştu.");
                }
            } catch (err) {
                console.error("Randevu iptal hatası:", err);
                toast.error("Randevu iptal edilirken bir hata oluştu.");
            }
        }
    };


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Müşteri Randevuları Yönetimi</h1>

            {isLoading ? (
                <div className="text-center py-10 text-gray-500">Randevular yükleniyor...</div>
            ) : error ? (
                <div className="text-center text-red-500 font-medium">{error}</div>
            ) : appointments.length > 0 ? (
                <div className="space-y-6">
                    {appointments.map(appointment => (
                        <div key={appointment.id} className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleAppointment(appointment.id)}>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Randevu ID: {appointment.id}
                                    </h2>
                                    <p className="text-gray-600">
                                        Tarih: <span className="font-semibold">{appointment.date}</span> | Saat: <span className="font-semibold">{appointment.startTime}</span>
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className={`py-1 px-3 rounded-full text-sm font-semibold 
                                        ${appointment.status === 'BOOKED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {appointment.status === 'BOOKED' ? 'Aktif' : 'İptal Edildi'}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleCancelAppointment(appointment.id); }}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title="Randevuyu İptal Et"
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            </div>

                            {/* Notlar ve Not Ekleme Alanı */}
                            {activeAppointmentId === appointment.id && (
                                <div className="mt-6 border-t pt-6">
                                    <h3 className="text-lg font-bold text-gray-700 mb-4">Randevu Notları</h3>
                                    
                                    <div className="space-y-4 mb-6">
                                        {appointment.notes && appointment.notes.length > 0 ? (
                                            appointment.notes.map(note => (
                                                <div key={note.id} className="bg-gray-100 p-4 rounded-lg flex justify-between items-start">
                                                    {editingNoteId === note.id ? (
                                                        <textarea
                                                            className="flex-grow p-2 border rounded-md resize-none"
                                                            value={editingNoteText}
                                                            onChange={(e) => setEditingNoteText(e.target.value)}
                                                            rows="3"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-800 pr-4">{note.noteText}</p>
                                                    )}
                                                    
                                                    <div className="flex-shrink-0 space-x-2">
                                                        {editingNoteId === note.id ? (
                                                            <button
                                                                onClick={() => handleUpdateNote(appointment.id, note.id)}
                                                                className="text-green-500 hover:text-green-700 transition-colors"
                                                                title="Kaydet"
                                                            >
                                                                <FontAwesomeIcon icon={faSave} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setEditingNoteId(note.id);
                                                                    setEditingNoteText(note.noteText);
                                                                }}
                                                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                                                title="Düzenle"
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteNote(appointment.id, note.id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors"
                                                            title="Sil"
                                                        >
                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-500 text-center py-4">Bu randevu için henüz not bulunmuyor.</div>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <textarea
                                            value={newNoteText}
                                            onChange={(e) => setNewNoteText(e.target.value)}
                                            className="flex-grow p-3 border border-gray-300 rounded-lg resize-none"
                                            rows="3"
                                            placeholder="Yeni not ekle..."
                                        />
                                        <button
                                            onClick={() => handleAddNote(appointment.id)}
                                            className="p-3 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                                            title="Not Ekle"
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
                <div className="text-center py-10 text-gray-500">Seçilen müşteri için hiç randevu bulunamadı.</div>
            )}
        </div>
    );
};

export default AdminAppointmentPage;
