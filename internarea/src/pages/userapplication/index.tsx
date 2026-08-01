import axios from "axios";
import {
  Briefcase,
  Calendar,
  ChevronRight,
  MapPin,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useLanguage } from '../../context/LanguageContext';
import { API_ENDPOINTS } from '../../config/api';

const index = () => {
  const { t } = useLanguage();
  const [applications, setapplications] = useState([]);
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.applications);
        setapplications(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchdata();
  }, []);
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('userApplication.title')}</h1>

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">{t('userApplication.noApplications')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app: any) => (
              <div key={app._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {app.user.name}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      {app.company} - {app.category}
                    </p>
                    <div className="flex items-center text-gray-500 text-sm mt-2">
                      <Calendar size={16} className="mr-1" />
                      <span>
                        {t('userApplication.appliedOn')}:{" "}
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                        app.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : app.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <Link
                    href={`/detailapplication/${app._id}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    {t('userApplication.viewDetails')}
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default index;