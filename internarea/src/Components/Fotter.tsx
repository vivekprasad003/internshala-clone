import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-gray-800 text-white py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          <FooterSection title={t('footer.internshipByPlaces')} items={[t('footer.newYork'), t('footer.losAngeles'), t('footer.chicago'), t('footer.sanFrancisco'), t('footer.miami'), t('footer.seattle')]} />
          <FooterSection title={t('footer.internshipByStream')} items={[t('footer.aboutUsText'), t('footer.careers'), t('footer.press'), t('footer.news'), t('footer.mediaKit'), t('footer.contact')]} links />
          <FooterSection title={t('footer.jobPlaces')} items={[t('footer.blog'), t('footer.newsletter'), t('footer.events'), t('footer.helpCenter'), t('footer.tutorials'), t('footer.supports')]} links />
          <FooterSection title={t('footer.jobsByStreams')} items={[t('footer.startups'), t('footer.enterprise'), t('footer.government'), t('footer.saas'), t('footer.marketplaces'), t('footer.ecommerce')]} links />
        </div>

        <hr className="my-8 sm:my-10 border-gray-600" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          <FooterSection title={t('footer.aboutUs')} items={[t('footer.startups'), t('footer.enterprise')]} links />
          <FooterSection title={t('footer.teamDiary')} items={[t('footer.startups'), t('footer.enterprise')]} links />
          <FooterSection title={t('footer.termsConditions')} items={[t('footer.startups'), t('footer.enterprise')]} links />
          <FooterSection title={t('footer.sitemap')} items={[t('footer.startups')]} links />
        </div>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <p className="flex items-center gap-2 border border-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700 text-sm sm:text-base">
            <i className="bi bi-google-play"></i> {t('footer.getAndroidApp')}
          </p>
          <div className="flex space-x-4">
            <FaFacebook className="w-5 h-5 sm:w-6 sm:h-6 hover:text-blue-400 cursor-pointer" />
            <FaTwitter className="w-5 h-5 sm:w-6 sm:h-6 hover:text-blue-400 cursor-pointer" />
            <FaInstagram className="w-5 h-5 sm:w-6 sm:h-6 hover:text-pink-400 cursor-pointer" />
          </div>
          <p className="text-xs sm:text-sm text-gray-400 text-center">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterSection({ title, items, links }: any) {
  return (
    <div>
      <h3 className="text-xs sm:text-sm font-bold text-gray-300">{title}</h3>
      <div className="flex flex-col items-start mt-2 sm:mt-4 space-y-1.5 sm:space-y-3">
        {items.map((item: any, index: any) =>
          links ? (
            <a key={index} href="/" className="text-xs sm:text-sm text-gray-400 hover:text-blue-400 hover:underline">
              {item}
            </a>
          ) : (
            <p key={index} className="text-xs sm:text-sm text-gray-400 hover:text-blue-400 hover:underline cursor-pointer">
              {item}
            </p>
          )
        )}
      </div>
    </div>
  );
}