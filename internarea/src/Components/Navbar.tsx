import React, { useState } from "react";
import Link from "next/link";
import { auth, provider } from "../firebase/firebase";
import { Search, Menu, X } from "lucide-react";
import { signInWithPopup, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { useLanguage } from '../context/LanguageContext';

interface User {
  name: string;
  email: string;
  photo: string;
}

const Navbar = () => {
  const user = useSelector(selectuser);
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handlelogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast.success(t('navbar.loginSuccess'));
    } catch (error) {
      console.error(error);
      toast.error(t('navbar.loginFailed'));
    }
  };

  const handlelogout = () => {
    signOut(auth);
  };

  const navLinks = [
    { href: "/internship", label: t('navbar.internships') },
    { href: "/job", label: t('navbar.jobs') },
    { href: "/language", label: t('navbar.languageSettings') },
    { href: "/resume", label: t('navbar.resumeCreation') },
    { href: "/forgotpassword", label: t('navbar.forgotPassword') },
    { href: "/publicspace", label: t('navbar.publicSpace') },
    { href: "/systemInfo", label: t('navbar.systemInfo') },
    { href: "/membership", label: t('navbar.membershipPlan') },
  ];

  return (
    <div className="relative">
      <nav className="bg-white shadow-md">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="text-xl font-bold text-blue-600">
                <img src={"/logo.png"} alt="" className="h-16" />
              </a>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-700 hover:text-blue-600 whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder={t('navbar.searchPlaceholder')}
                  className="text-gray-600 ml-2 bg-transparent focus:outline-none text-sm w-36"
                />
              </div>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link href={"/profile"}>
                    <img
                      src={user.photo}
                      alt=""
                      className="w-8 h-8 rounded-full cursor-pointer"
                    />
                  </Link>
                  <button
                    className="text-sm text-gray-700 hover:text-blue-600 font-medium"
                    onClick={handlelogout}
                  >
                    {t('navbar.logout')}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handlelogin}
                    className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-gray-700">{t('navbar.continueWithGoogle')}</span>
                  </button>
                  <Link
                    href="/adminlogin"
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    {t('navbar.admin')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburguer + Auth */}
            <div className="flex lg:hidden items-center space-x-3">
              {user ? (
                <Link href={"/profile"}>
                  <img
                    src={user.photo}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                </Link>
              ) : (
                <button
                  onClick={handlelogin}
                  className="text-sm text-blue-600 font-medium border border-blue-300 rounded-lg px-3 py-1.5 hover:bg-blue-50"
                >
                  {t('navbar.continueWithGoogle')}
                </button>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-blue-600 focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-out Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-72 bg-white shadow-xl overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <span className="font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="py-4">
              {/* Mobile Search */}
              <div className="px-4 mb-4">
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('navbar.searchPlaceholder')}
                    className="text-gray-600 ml-2 bg-transparent focus:outline-none text-sm w-full"
                  />
                </div>
              </div>
              {/* Navigation Links */}
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              {/* Mobile Auth */}
              <div className="border-t mt-4 pt-4 px-6 space-y-3">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.photo}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm text-gray-700">{user.name}</span>
                    </div>
                    <button
                      onClick={handlelogout}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      {t('navbar.logout')}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handlelogin}
                      className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span className="text-gray-700">{t('navbar.continueWithGoogle')}</span>
                    </button>
                    <Link
                      href="/adminlogin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-center text-sm text-gray-600 hover:text-gray-800"
                    >
                      {t('navbar.admin')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;