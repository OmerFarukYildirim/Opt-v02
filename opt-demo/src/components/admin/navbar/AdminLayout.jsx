// src/components/admin/AdminLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../navbar/AdminSideBar';

const AdminLayout = () => {
    return (
        // Sayfa düzeninin ana kapsayıcısı.
        // d-flex ile sol ve sağ kısım yan yana yerleştirilir.
        // min-h-screen ile sayfanın tüm yüksekliğini kaplaması sağlanır.
        <div className="flex flex-row min-h-screen bg-gray-50">
            
            {/* Sol taraftaki Sidebar alanı. Büyük ekranlarda 64px genişliğinde, küçük ekranlarda esnek olacak şekilde ayarlandı. */}
            <aside className="w-64 p-4 shadow-xl bg-white border-r border-gray-200">
                <AdminSidebar />
            </aside>

            {/* Sağ taraftaki ana içerik alanı. flex-1 ile kalan tüm alanı kaplar. */}
            <main className="flex-1 flex flex-col overflow-hidden">
                
            
                
                {/* Asıl sayfa içeriğinin yer alacağı kısım.
                    Sayfa çok uzunsa kaydırma çubuğu burada belirir. */}
                <section className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </section>
            </main>
        </div>
    );
};

export default AdminLayout;
