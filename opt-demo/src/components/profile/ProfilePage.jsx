import React, { useState, useEffect, useRef } from 'react';
import ApiService from '../../services/ApiService';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        address: ''
    });
    const [selectedFile, setSelectedFile] = useState(null); // Yeni eklenen state
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const fileInputRef = useRef(null); // Yeni eklenen ref

    // Kullanıcının profil bilgilerini çeker
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await ApiService.myProfile();
            if (response.statusCode === 200) {
                const userData = response.data;
                setProfile(userData);
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    phoneNumber: userData.phoneNumber || '',
                    address: userData.address || ''
                });
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError('Profil bilgileri alınamadı.');
            console.error('Profil bilgileri çekilirken hata oluştu:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Form alanlarındaki değişiklikleri yönetir
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Fotoğraf seçimini yönetir
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    // "Fotoğrafı Değiştir" butonuna tıklandığında gizli dosya girişini tetikler
    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    // Profil güncelleme işlemini yönetir
    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setError(null);
        try {
            const updateData = new FormData();
            updateData.append('name', formData.name);
            updateData.append('email', formData.email);
            updateData.append('phoneNumber', formData.phoneNumber);
            updateData.append('address', formData.address);

            // ÖNEMLİ DEĞİŞİKLİK: Dosyayı 'imageFile' adıyla ekleyin
            if (selectedFile) {
                updateData.append('imageFile', selectedFile);
            }

            const response = await ApiService.updateProfile(updateData);
            if (response.statusCode === 200) {
                alert('Profil başarıyla güncellendi!');
                fetchProfile(); // Güncellenmiş verileri yeniden çek
                setSelectedFile(null); // Dosya yüklendikten sonra seçimi sıfırla
            } else {
                setError(response.message);
                alert('Güncelleme sırasında bir hata oluştu: ' + response.message);
            }
        } catch (err) {
            setError('Profil güncellenirken beklenmedik bir hata oluştu.');
            alert('Profil güncellenirken beklenmedik bir hata oluştu.');
            console.error('Profil güncelleme hatası:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    // Hesabı devre dışı bırakma işlemini yönetir
    const handleDeactivate = async () => {
        if (window.confirm('Hesabınızı devre dışı bırakmak istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            try {
                const response = await ApiService.deactivateProfile();
                if (response.statusCode === 200) {
                    alert('Hesabınız başarıyla devre dışı bırakıldı.');
                    ApiService.logout();
                    navigate('/login');
                } else {
                    setError(response.message);
                    alert('Hesabı devre dışı bırakırken bir hata oluştu: ' + response.message);
                }
            } catch (err) {
                setError('Hesap devre dışı bırakılırken beklenmedik bir hata oluştu.');
                alert('Hesap devre dışı bırakılırken beklenmedik bir hata oluştu.');
                console.error('Hesap devre dışı bırakma hatası:', err);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                <FontAwesomeIcon icon={faSpinner} spin className="text-orange-500 text-4xl" />
                <p className="ml-4 text-gray-700">Yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 text-red-500 font-bold"><p>{error}</p></div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen py-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8 sm:p-12">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Profilim</h2>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-orange-200">
                        {profile?.profileUrl || selectedFile ? (
                            <img
                                src={selectedFile ? URL.createObjectURL(selectedFile) : profile.profileUrl}
                                alt="Profil Resmi"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <FontAwesomeIcon icon={faUserCircle} className="w-full h-full text-gray-300" />
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={handleButtonClick}
                        className="text-orange-500 font-medium hover:underline transition-colors"
                    >
                        Fotoğrafı Değiştir
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1">
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Ad Soyad</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">E-posta</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-1">Telefon Numarası</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-1">Adres</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row justify-end mt-4 space-y-4 sm:space-y-0 sm:space-x-4">
                        <button
                            type="submit"
                            className="bg-orange-500 text-white font-bold py-3 px-6 rounded-md hover:bg-orange-600 transition-colors shadow-lg flex items-center justify-center disabled:bg-gray-400"
                            disabled={isUpdating}
                        >
                            {isUpdating ? <><FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> Güncelleniyor...</> : 'Profili Güncelle'}
                        </button>
                        <button
                            type="button"
                            className="bg-red-500 text-white font-bold py-3 px-6 rounded-md hover:bg-red-600 transition-colors shadow-lg"
                            onClick={handleDeactivate}
                        >
                            Hesabı Devre Dışı Bırak
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;