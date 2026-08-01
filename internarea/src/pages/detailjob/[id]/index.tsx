import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Book,
  Calendar,
  Cat,
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { useLanguage } from '../../../context/LanguageContext';
import { API_ENDPOINTS } from '../../../config/api';

const DetailJob = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState<any>(null);
  const user = useSelector(selectuser);

  useEffect(() => {
    if (id) {
      const fetchJob = async () => {
        try {
          const res = await axios.get(API_ENDPOINTS.jobById(id as string));
          setJob(res.data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchJob();
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
        jobId: id,
        userEmail: user.email,
        userName: user.name,
        company: job.company,
        category: job.category,
      });
      toast.success("Application submitted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit application");
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/job"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          ← {t('detail.back')}
        </Link>

        {/* Job Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-8 py-4 sm:py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <p className="text-blue-100 mt-1">{job.company}</p>
              </div>
              <span className="px-3 py-1 bg-blue-500 rounded-full text-sm">
                {t('detail.job')}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-8">
            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <MapPin className="h-5 w-5 text-blue-600 mb-2" />
                <p className="text-sm text-gray-500">{t('detail.location')}</p>
                <p className="font-semibold text-gray-900">{job.location}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <DollarSign className="h-5 w-5 text-green-600 mb-2" />
                <p className="text-sm text-gray-500">{t('detail.ctc')}</p>
                <p className="font-semibold text-gray-900">{job.CTC}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <Clock className="h-5 w-5 text-purple-600 mb-2" />
                <p className="text-sm text-gray-500">{t('detail.experience')}</p>
                <p className="font-semibold text-gray-900">{job.Experience}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <Calendar className="h-5 w-5 text-orange-600 mb-2" />
                <p className="text-sm text-gray-500">{t('detail.startDate')}</p>
                <p className="font-semibold text-gray-900">{job.StartDate}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {t('detail.aboutCompany')}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {job.aboutCompany}
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {t('detail.aboutJob')}
                </h2>
                <p className="text-gray-600 leading-relaxed">{job.aboutJob}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {t('detail.whoCanApply')}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {job.Whocanapply}
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {t('detail.perks')}
                </h2>
                <p className="text-gray-600 leading-relaxed">{job.perks}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {t('detail.additionalInfo')}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {job.AdditionalInfo}
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {t('detail.numberOfOpenings')}
                </h2>
                <p className="text-gray-600">{job.numberOfopning}</p>
              </section>
            </div>

            {/* Apply Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleApply}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-2"
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

export default DetailJob;