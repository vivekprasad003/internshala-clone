import Footer from "@/Components/Fotter";
import Navbar from "@/Components/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { store } from "../store/store";
import { Provider, useDispatch } from "react-redux";
import { useEffect } from "react";
import { auth } from "@/firebase/firebase";
import { login, logout } from "@/Feature/Userslice";
import { getStoredUsers, saveUsers } from "../TS_files/security";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LanguageProvider } from '../context/LanguageContext';
export default function App({ Component, pageProps }: AppProps) {
  function AuthListener() {
    const dispatch = useDispatch();
    useEffect(() => {
      auth.onAuthStateChanged((authuser) => {
        if (authuser) {
          const userData = {
            uid: authuser.uid,
            photo: authuser.photoURL,
            name: authuser.displayName,
            email: authuser.email,
            phoneNumber: authuser.phoneNumber,
          };
          dispatch(login(userData));
          // Persist Firebase-authenticated user to 'app_users' localStorage
          // so ForgotPassword phone lookup can find them
          const appUsers = getStoredUsers();
          const exists = appUsers.find(u => u.email?.toLowerCase() === (authuser.email || '').toLowerCase());
          if (!exists && authuser.email) {
            appUsers.push({
              id: 'fb-' + authuser.uid,
              name: authuser.displayName || authuser.email?.split('@')[0] || 'User',
              email: authuser.email || '',
              phone: authuser.phoneNumber || '',
              passwordHash: '',
              createdAt: new Date().toISOString(),
            });
            saveUsers(appUsers);
          }
        } else {
          dispatch(logout());
        }
      });
    }, [dispatch]);
    return null;
  }

  function RenderConnectionTest() {
    useEffect(() => {
      fetch("https://my-backend.onrender.com/api/users")
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.error("Render backend connection error:", err));
    }, []);
    return null;
  }

  return (
    <Provider store={store}>
      <LanguageProvider>
        <AuthListener />
        <RenderConnectionTest />
        <div className="bg-white">
          <ToastContainer/>
          <Navbar />
          <Component {...pageProps} />
          <Footer />
        </div>
      </LanguageProvider>
    </Provider>
  );
}