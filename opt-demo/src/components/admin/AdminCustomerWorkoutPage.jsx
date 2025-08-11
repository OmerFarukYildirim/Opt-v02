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
    faDumbbell,
} from '@fortawesome/free-solid-svg-icons';

const AdminCustomerWorkoutPage = () => {
    const { customerId } = useParams();
    const [workouts, setWorkouts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [newWorkoutName, setNewWorkoutName] = useState('');
    // DTO'daki workoutTime alanına karşılık gelen state
    // '09:00' gibi varsayılan bir saat değeri ayarlandı.
    const [newWorkoutTime, setNewWorkoutTime] = useState('09:00');
    const [activeWorkoutId, setActiveWorkoutId] = useState(null);
    const [editingWorkoutExerciseId, setEditingWorkoutExerciseId] = useState(null);
    const [editingWorkoutExerciseData, setEditingWorkoutExerciseData] = useState({ name: '', description: '', youtubeUrl: '' });

    // Müşteriye ait antrenman programlarını çeken fonksiyon
    const fetchWorkouts = async () => {
        if (!customerId) return;

        setIsLoading(true);
        setError(null);
        try {
            const ptId = ApiService.getUserId();
            if (!ptId) {
                throw new Error("Personal trainer ID not found.");
            }

            const workoutRequestDTO = {
                ptId: ptId,
                customerId: customerId,
            };

            const response = await ApiService.getOwnWorkouts(workoutRequestDTO);
            console.log("Antrenman Programı Listesi:", response.data);

            if (response.statusCode === 200) {
                setWorkouts(response.data);
            } else {
                setWorkouts([]);
            }
        } catch (err) {
            console.error("Antrenman programı çekme hatası:", err);
            setError("Antrenman programları getirilemedi.");
            setWorkouts([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Belirli bir antrenman için egzersizleri çeken fonksiyon
    const fetchWorkoutExercises = async (workoutId) => {
        try {
            console.log("Fetching workout exercises for workout ID:", workoutId);
            const response = await ApiService.getWorkoutExercisesByWorkoutId(workoutId);
            if (response.statusCode === 200) {
                setWorkouts(prevWorkouts => prevWorkouts.map(workout =>
                    workout.id === workoutId ? { ...workout, workoutExercises: response.data } : workout
                ));
            } else {
                toast.error("Antrenman detayları getirilirken bir hata oluştu.");
            }
        } catch (err) {
            console.error("Antrenman detayı çekme hatası:", err);
            toast.error("Antrenman detayları getirilemedi.");
        }
    };

    useEffect(() => {
        fetchWorkouts();
    }, [customerId]);

    // Antrenman programını genişletip egzersizleri gösterme/gizleme
    const toggleWorkout = (workoutId) => {
        if (activeWorkoutId === workoutId) {
            setActiveWorkoutId(null);
        } else {
            setActiveWorkoutId(workoutId);
            const workout = workouts.find(w => w.id === workoutId);
            if (workout && (!workout.workoutExercises || workout.workoutExercises.length === 0)) {
                fetchWorkoutExercises(workoutId);
            }
        }
    };

    // Yeni bir antrenman programı ekleme
    const handleCreateWorkout = async () => {
        if (!customerId || !selectedDate) {
            toast.error("Müşteri ID'si veya tarih belirtilmemiş.");
            return;
        }
        try {
            const ptId = ApiService.getUserId();
            const workoutRequestDTO = {
                ptId,
                customerId,
                date: selectedDate
            };
            const response = await ApiService.createWorkout(workoutRequestDTO);
            if (response.statusCode === 200) {
                toast.success("Antrenman programı başarıyla oluşturuldu.");
                fetchWorkouts();
            } else {
                toast.error(response.message || "Antrenman programı oluşturulurken bir hata oluştu.");
            }
        } catch (err) {
            console.error("Antrenman programı oluşturma hatası:", err);
            toast.error("Antrenman programı oluşturulurken bir hata oluştu.");
        }
    };

    // Antrenman programını silme
    const handleDeleteWorkout = async (workoutId) => {
        if (window.confirm("Bu antrenman programını silmek istediğinizden emin misiniz?")) {
            try {
                const response = await ApiService.deleteWorkout(workoutId);
                if (response.statusCode === 200) {
                    toast.success("Antrenman programı başarıyla silindi.");
                    fetchWorkouts();
                } else {
                    toast.error(response.message || "Antrenman programı silinirken bir hata oluştu.");
                }
            } catch (err) {
                console.error("Antrenman programı silme hatası:", err);
                toast.error("Antrenman programı silinirken bir hata oluştu.");
            }
        }
    };

    // Yeni egzersiz ekleme (DTO'ya uygun hale getirildi)
    const handleAddWorkoutExercise = async (workoutId) => {
        if (!newWorkoutName.trim() || !newWorkoutTime.trim()) {
            toast.warn("Lütfen bir egzersiz adı ve saati girin.");
            return;
        }
        try {
            const workoutExerciseRequestDTO = {
                workoutId,
                name: newWorkoutName,
                description: "Örnek açıklama",
                youtubeUrl: "asd",
                workoutTime: newWorkoutTime,
            };
            console.log("Yeni egzersiz ekleme isteği:", workoutExerciseRequestDTO);
            const response = await ApiService.createWorkoutExercise(workoutExerciseRequestDTO);
            if (response.statusCode === 200) {
                toast.success("Egzersiz başarıyla eklendi.");
                setNewWorkoutName('');
                fetchWorkoutExercises(workoutId);
            } else {
                toast.error(response.message || "Egzersiz eklenirken bir hata oluştu.");
            }
        } catch (err) {
            console.error("Egzersiz ekleme hatası:", err);
            toast.error("Egzersiz eklenirken bir hata oluştu.");
        }
    };

    // Egzersiz düzenleme
    const handleUpdateWorkoutExercise = async (workoutId, workoutExercise) => {
        try {
            const workoutExerciseRequestDTO = {
                ...workoutExercise,
                name: editingWorkoutExerciseData.name,
                description: editingWorkoutExerciseData.description,
                youtubeUrl: editingWorkoutExerciseData.youtubeUrl
            };
            const response = await ApiService.updateWorkoutExercise(workoutExerciseRequestDTO);
            if (response.statusCode === 200) {
                toast.success("Egzersiz başarıyla güncellendi.");
                setEditingWorkoutExerciseId(null);
                setEditingWorkoutExerciseData({ name: '', description: '', youtubeUrl: '' });
                fetchWorkoutExercises(workoutId);
            } else {
                toast.error(response.message || "Egzersiz güncellenirken bir hata oluştu.");
            }
        } catch (err) {
            console.error("Egzersiz güncelleme hatası:", err);
            toast.error("Egzersiz güncellenirken bir hata oluştu.");
        }
    };

    // Egzersiz silme
    const handleDeleteWorkoutExercise = async (workoutId, workoutExerciseId) => {
        if (window.confirm("Bu egzersizi silmek istediğinizden emin misiniz?")) {
            try {
                const response = await ApiService.deleteWorkoutExercise(workoutExerciseId);
                if (response.statusCode === 200) {
                    toast.success("Egzersiz başarıyla silindi.");
                    fetchWorkoutExercises(workoutId);
                } else {
                    toast.error(response.message || "Egzersiz silinirken bir hata oluştu.");
                }
            } catch (err) {
                console.error("Egzersiz silme hatası:", err);
                toast.error("Egzersiz silinirken bir hata oluştu.");
            }
        }
    };

    const handleEditClick = (workoutExercise) => {
        setEditingWorkoutExerciseId(workoutExercise.id);
        setEditingWorkoutExerciseData({
            name: workoutExercise.name || '',
            description: workoutExercise.description || '',
            youtubeUrl: workoutExercise.youtubeUrl || ''
        });
    };

    // Filter workouts by selected date
    const filteredWorkouts = workouts.filter(workout => workout.date === selectedDate);


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Antrenman Programı Yönetimi</h1>

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
                <div className="text-center py-10 text-gray-500">Antrenman programı yükleniyor...</div>
            ) : error ? (
                <div className="text-center text-red-500 font-medium">{error}</div>
            ) : filteredWorkouts.length > 0 ? (
                <div className="space-y-6">
                    {filteredWorkouts.map(workout => (
                        <div key={workout.id} className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleWorkout(workout.id)}>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Antrenman Programı - Tarih: {workout.date}
                                    </h2>
                                    <p className="text-gray-600">
                                        Oluşturan (PT ID): <span className="font-semibold">{workout.ptId}</span>
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteWorkout(workout.id); }}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title="Antrenman Programını Sil"
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </div>
                            </div>

                            {activeWorkoutId === workout.id && (
                                <div className="mt-6 border-t pt-6">
                                    <h3 className="text-lg font-bold text-gray-700 mb-4">Egzersiz Detayları</h3>

                                    <div className="space-y-4 mb-6">
                                        {workout.workoutExercises && workout.workoutExercises.length > 0 ? (
                                            workout.workoutExercises.map(exercise => (
                                                <div key={exercise.id} className="bg-gray-100 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                                    {editingWorkoutExerciseId === exercise.id ? (
                                                        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                                            <div className="flex flex-col">
                                                                <label className="text-sm text-gray-600">Egzersiz Adı</label>
                                                                <input
                                                                    className="p-2 border rounded-md"
                                                                    value={editingWorkoutExerciseData.name}
                                                                    onChange={(e) => setEditingWorkoutExerciseData({ ...editingWorkoutExerciseData, name: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <label className="text-sm text-gray-600">Açıklama</label>
                                                                <input
                                                                    className="p-2 border rounded-md"
                                                                    value={editingWorkoutExerciseData.description}
                                                                    onChange={(e) => setEditingWorkoutExerciseData({ ...editingWorkoutExerciseData, description: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <label className="text-sm text-gray-600">YouTube URL</label>
                                                                <input
                                                                    className="p-2 border rounded-md"
                                                                    value={editingWorkoutExerciseData.youtubeUrl}
                                                                    onChange={(e) => setEditingWorkoutExerciseData({ ...editingWorkoutExerciseData, youtubeUrl: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex-grow pr-4">
                                                            <h4 className="font-semibold text-gray-800 flex items-center">
                                                                <FontAwesomeIcon icon={faDumbbell} className="mr-2 text-orange-500" />
                                                                {exercise.name}
                                                            </h4>
                                                            <p className="text-gray-600 text-sm mt-1">{exercise.description}</p>
                                                            {exercise.youtubeUrl && (
                                                                <a href={exercise.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm hover:underline mt-1 block">YouTube Videosu</a>
                                                            )}
                                                            <p className="text-gray-500 text-xs mt-1">Antrenman Zamanı: {exercise.workoutTime}</p>
                                                        </div>
                                                    )}

                                                    <div className="flex-shrink-0 space-x-2 mt-4 sm:mt-0">
                                                        {editingWorkoutExerciseId === exercise.id ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateWorkoutExercise(workout.id, exercise)}
                                                                    className="text-green-500 hover:text-green-700 transition-colors"
                                                                    title="Kaydet"
                                                                >
                                                                    <FontAwesomeIcon icon={faSave} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingWorkoutExerciseId(null)}
                                                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                                                    title="İptal"
                                                                >
                                                                    <FontAwesomeIcon icon={faTimes} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleEditClick(exercise)}
                                                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                                                title="Düzenle"
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteWorkoutExercise(workout.id, exercise.id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors"
                                                            title="Sil"
                                                        >
                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-500 text-center py-4">Bu program için henüz egzersiz detayı bulunmuyor.</div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            value={newWorkoutName}
                                            onChange={(e) => setNewWorkoutName(e.target.value)}
                                            className="p-3 border border-gray-300 rounded-lg flex-grow"
                                            placeholder="Yeni egzersiz adı..."
                                        />
                                        {/* Seçme kutusu yerine saat seçici eklendi */}
                                        <input
                                            type="time"
                                            value={newWorkoutTime}
                                            onChange={(e) => setNewWorkoutTime(e.target.value)}
                                            className="p-3 border border-gray-300 rounded-lg"
                                        />
                                        <button
                                            onClick={() => handleAddWorkoutExercise(workout.id)}
                                            className="p-3 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                                            title="Egzersiz Ekle"
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
                    <p>Seçilen tarih için hiç antrenman programı bulunamadı.</p>
                    <button
                        onClick={handleCreateWorkout}
                        className="mt-4 p-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        <span>Bu tarih için yeni antrenman programı oluştur</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminCustomerWorkoutPage;
