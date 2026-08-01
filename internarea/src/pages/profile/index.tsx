import { selectuser } from "@/Feature/Userslice";
import { ExternalLink, Mail, User } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";
import { useLanguage } from '../../context/LanguageContext';

interface User {
  name: string;
  email: string;
  photo: string;
}

const index = () => {
  const { t } = useLanguage();
  const user = useSelector(selectuser);
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-24 sm:h-32 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-10 sm:-bottom-12 left-1/2 transform -translate-x-1/2">
              {user?.photo ? (
                <img
                  src={user?.photo}
                  alt={user?.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <User className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-14 sm:pt-16 pb-8 px-4 sm:px-6">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user?.name}</h1>
              <div className="mt-2 flex items-center justify-center text-gray-500 text-sm sm:text-base">
                <Mail className="h-4 w-4 mr-2" />
                <span className="truncate">{user?.email}</span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                  <span className="text-blue-600 font-semibold text-xl sm:text-2xl">
                    0
                  </span>
                  <p className="text-blue-600 text-xs sm:text-sm mt-1">
                    {t('profile.myApplications')}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
                  <span className="text-green-600 font-semibold text-xl sm:text-2xl">
                    0
                  </span>
                  <p className="text-green-600 text-xs sm:text-sm mt-1">
                    {t('common.success')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center pt-4">
                <Link
                  href="/userapplication"
                  className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
                >
                  {t('profile.myApplications')}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;