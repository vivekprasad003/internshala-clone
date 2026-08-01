import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Banknote,
  Calendar,
  Clock,
  MapPin,
  PlayCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { useLanguage } from '../../../context/LanguageContext';
import { API_ENDPOINTS } from '../../../config/api';

const DetailInternship = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = router.query;
  const [internship, setInternship] = useState<any>(null);
  const user = useSelector(selectuser);

  useEffect(() => {
    if (id) {
      const fetchInternship = async () => {
        try {
          const res = await axios.get(API_ENDPOINTS.internshipById(id as string));
          setInternship(res.data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchInternship();
    }
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      toast.error("Please sign in to apply");
      return;
    }
    try {
      await axios.post(API_ENDPOINTS.applications, {
        userId: user.uid,
        internshipId: id,
        userEmail: user.email,
        userName: user.name,
        company: internship.company,
        category: internship.category,
      });
      toast.success("Application submitted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit application");
    }
  };

  if (!internship) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/internship"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          ← {t('detail.back')}
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-8 py-4 sm:py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{internship.title}</h1>
                <p className="text-purple-100 mt-1">{internship.company}</p>
              </div>
              <span className="px-3 py-1 bg-purple-500 rounded-full text-sm">
                {t('detail.internship')}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <MapPin className="h-5 w-5 text-purple-600 mb-2" />
                <p className="text-sm text-gray-500">{t('detail.location')}</p>
                <p className="font-semibold text-gray-900">{internship.location}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <Banknote className="h-5 w-5 text-green-600 mb-2" />
                <p className="text-sm text-gray-500">{t('detail.stipend')}</p>
                <p className="font-semibold text-gray-900">{internship.stipend}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <Calendar className="h-5 w-5 text-orange-600 mb-2" />
                <p className="text-sm text-gray-500">{t('detail.duration')}</p>
                <p className="font-semibold text-gray-900">{internship.duration}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <PlayCircle className="h-5 w-5 text-blue-600 mb-2" />
                <p className="text-sm text-gray-500">{t('detail.startDate')}</p>
                <p className="font-semibold text-gray-900">{internship.startDate}</p>
              </div>
            </div>

            <div className="space-y-6">
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {t('detail.aboutCompany')}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {internship.aboutCompany}
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {t('detail.aboutJob')}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {internship.aboutJob}
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {t('detail.whoCanApply')}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {internship.Whocanapply}
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {t('detail.perks')}
                </h2>
                <p className="text-gray-600 leading-relaxed">{internship.perks}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {t('detail.additionalInfo')}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {internship.AdditionalInfo}
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {t('detail.numberOfOpenings')}
                </h2>
                <p className="text-gray-600">{internship.numberOfopning}</p>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleApply}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition duration-200 flex items-center justify-center space-x-2"
              >
                <span>{t('detail.applyNow')}</span>
                <ArrowUpRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailInternship;