import Link from 'next/link';
import { ArrowLeft, HeartPulse } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#05080d] text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <HeartPulse className="h-8 w-8 text-teal-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-6">Terms of Medical Service</h1>
        
        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            Please read these Terms of Medical Service carefully before using our platform. By accessing or using our services, you agree to be bound by these terms.
          </p>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Medical Emergencies</h2>
          <p>
            DO NOT USE THIS PLATFORM FOR MEDICAL EMERGENCIES. If you are experiencing a medical emergency, please call 911 or go to the nearest emergency room immediately. This platform is designed for non-emergency medical consultations only.
          </p>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Provider-Patient Relationship</h2>
          <p>
            Using our platform does not establish a provider-patient relationship until you have connected with a healthcare professional for a consultation. All medical advice is provided solely by the licensed healthcare professionals on the platform.
          </p>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Technology Requirements</h2>
          <p>
            To use our telehealth services, you must have compatible hardware, software, and internet access. We are not responsible for connection issues or technological failures on your end during a consultation.
          </p>
        </div>
      </div>
    </div>
  );
}
