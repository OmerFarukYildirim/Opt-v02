// src/components/admin/AdminSidebar.jsx

import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarCheck, 
  faCalendarAlt,
  faDrumstickBite,
  faDumbbell,
  faUsers    
} from '@fortawesome/free-solid-svg-icons';

const AdminSidebar = () => {
  const { customerId } = useParams();

  const baseLinkClasses = "flex items-center p-4 rounded-lg transition-colors duration-200";
  const activeLinkClasses = "bg-orange-500 text-white shadow-md";
  const inactiveLinkClasses = "text-gray-600 hover:bg-gray-200 hover:text-orange-600";

  return (
    <div className="flex flex-col bg-gray-100 text-gray-800 p-4 rounded-lg shadow-md h-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-orange-600">Admin Paneli</h2>
        <p className="text-sm text-gray-500 mt-1">Yönetim</p>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {/* Müşteri Listesi linki */}
          <li>
            <NavLink 
              to="/admin/home"
              className={({ isActive }) => 
                `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
              }
              end
            >
              <FontAwesomeIcon icon={faUsers} className="mr-3 text-lg" />
              <span>Müşteri Listesi</span>
            </NavLink>
          </li>
          
          {/* Müsaitlik linki - Global olarak çalışacak */}
          <li>
            <NavLink 
              to="/admin/home/availability"
              className={({ isActive }) => 
                `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
              }
            >
              <FontAwesomeIcon icon={faCalendarCheck} className="mr-3 text-lg" />
              <span>Müsaitlik</span>
            </NavLink>
          </li>

          {/* Aşağıdaki linkler, customerId parametresine ihtiyaç duyacak */}
          {customerId && (
            <>
              <li>
                <NavLink 
                  to={`/admin/home/customer/${customerId}/appointments`}
                  className={({ isActive }) => 
                    `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                  }
                >
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-3 text-lg" />
                  <span>Randevular</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to={`/admin/home/customer/${customerId}/meals`}
                  className={({ isActive }) => 
                    `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                  }
                >
                  <FontAwesomeIcon icon={faDrumstickBite} className="mr-3 text-lg" />
                  <span>Öğün Programı</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to={`/admin/home/customer/${customerId}/workouts`}
                  className={({ isActive }) => 
                    `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                  }
                >
                  <FontAwesomeIcon icon={faDumbbell} className="mr-3 text-lg" />
                  <span>Spor Programı</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
