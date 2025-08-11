// src/components/common/Footer.js
import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white p-6 mt-auto">
            <div className="container mx-auto text-center">
                <p className="text-sm">
                    &copy; {new Date().getFullYear()} OmerApp. Tüm hakları saklıdır.
                </p>
                <p className="text-sm mt-2">
                    İletişim: <a href="mailto:support@omerapp.com" className="hover:underline">support@omerapp.com</a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
