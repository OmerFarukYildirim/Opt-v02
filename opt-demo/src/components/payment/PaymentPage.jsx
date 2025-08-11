// src/components/statuspages/PaymentPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import { useError } from '../common/ErrorDisplay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faSpinner, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentPage = () => {
    const navigate = useNavigate();
    const { ErrorDisplay, showError } = useError();
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'failure', 'pending'

    // StrictMode'un useEffect'i iki kere çalıştırmasını engellemek için ref kullanıyoruz
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const createPaymentIntent = async () => {
            setIsLoading(true);
            try {
                const userInfoResponse = await ApiService.myProfile();
                const userId = userInfoResponse?.data?.id;
                if (!userId) {
                    navigate('/login');
                    return;
                }

                // Backend burada eğer varsa mevcut PENDING intent'i döndürecek şekilde yazılmalı
                const response = await ApiService.initializePayment(userId);

                if (response.statusCode === 200 && response.data) {
                    setClientSecret(response.data);
                } else {
                    showError(response.message || "Ödeme başlatılırken bir hata oluştu.");
                    navigate('/approval-pending');
                }
            } catch (error) {
                console.error("Ödeme başlatılırken hata:", error);
                showError(error.message || "Ödeme hizmetine bağlanırken bir hata oluştu.");
                navigate('/approval-pending');
            } finally {
                setIsLoading(false);
            }
        };

        createPaymentIntent();
    }, [navigate, showError]);

    const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setIsLoading(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
        showError("Kart bilgileri bulunamadı. Lütfen tekrar deneyin.");
        setIsLoading(false);
        return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
    });

    if (error) {
        console.error("Ödeme hatası:", error.message);
        showError(error.message);
        setPaymentStatus('failure');
        setIsLoading(false);

        await ApiService.updatePaymentStatus({
            transactionId: paymentIntent ? paymentIntent.id : 'N/A',
            success: false,
            paymentStatus: 'FAILED',
            failureReason: error.message
        });

        const userInfoResponse = await ApiService.myProfile();
        const userId = userInfoResponse?.data?.id;
        await ApiService.setUserStatus(userId, 'APPROVE');
    } else {
        console.log("Ödeme başarılı:", paymentIntent);
        setPaymentStatus('success');
        showError("Ödemeniz başarıyla alındı!");

        await ApiService.updatePaymentStatus({
            transactionId: paymentIntent.id,
            success: true,
            paymentStatus: 'COMPLETED',
            failureReason: null
        });

        const userInfoResponse = await ApiService.myProfile();
        const userId = userInfoResponse?.data?.id;
        await ApiService.setUserStatus(userId, 'ACTIVE');

        setTimeout(() => navigate('/approval-pending'), 2000);
    }
};


    const renderPaymentContent = () => {
        if (isLoading && !clientSecret && !paymentStatus) {
            return (
                <div className="text-center text-gray-700">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-orange-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Ödeme Sayfası Yükleniyor</h2>
                    <p>Lütfen bekleyin...</p>
                </div>
            );
        }

        if (paymentStatus === 'success') {
            return (
                <div className="text-center text-gray-700">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Ödeme Başarılı!</h2>
                    <p>Üyeliğiniz aktif hale getirildi. Ana sayfaya yönlendiriliyorsunuz.</p>
                </div>
            );
        }

        if (paymentStatus === 'failure') {
            return (
                <div className="text-center text-gray-700">
                    <FontAwesomeIcon icon={faTimesCircle} className="text-4xl text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Ödeme Başarısız</h2>
                    <p>Ödemeniz işlenemedi. Lütfen bilgilerinizi kontrol edip tekrar deneyin.</p>
                    <button
                        onClick={() => setPaymentStatus(null)}
                        className="mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                    >
                        Tekrar Dene
                    </button>
                </div>
            );
        }

        if (clientSecret && !paymentStatus) {
            return (
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold text-center text-gray-800">Ödeme Bilgileri</h2>
                    <div className="p-4 border border-gray-300 rounded-lg">
                        <CardElement className="p-2" />
                    </div>
                    <button
                        type="submit"
                        disabled={!stripe || isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
                    >
                        {isLoading && paymentStatus === 'PENDING' ? (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                                Ödemeyi Tamamla
                            </>
                        )}
                    </button>
                </form>
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 space-y-6">
                <ErrorDisplay />
                {renderPaymentContent()}
            </div>
        </div>
    );
};

export default PaymentPage;
