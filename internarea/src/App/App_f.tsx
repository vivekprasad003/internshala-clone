/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ForgotPassword from '../Components/ForgotPassword';

export function ForgotPasswordApp() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Center content containing Forgot Password form */}
      <main id="app-main-content" className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md my-auto">
          <ForgotPassword 
            onBackToLogin={() => {
              // Reload back to step 1 for testing
              window.location.reload();
            }} 
            initialContact=""
          />
        </div>
      </main>

    </div>
  );
}