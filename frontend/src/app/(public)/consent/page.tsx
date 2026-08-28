import Link from 'next/link';
import { ArrowLeft, HeartPulse } from 'lucide-react';

export default function TelehealthConsent() {
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
        
        <h1 className="text-3xl font-bold text-white mb-6">Telehealth Consent</h1>
        
        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            Telehealth involves the use of electronic communications to enable healthcare providers at different locations to share individual patient medical information for the purpose of improving patient care.
          </p>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Nature of Telehealth Consultations</h2>
          <p>
            During your telehealth consultation, details of your medical history, examinations, x-rays, and test will be discussed with other health professionals through interactive video, audio, and telecommunication technology.
          </p>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Risks and Benefits</h2>
          <p>
            Expected benefits include improved access to medical care and more efficient medical evaluation. Possible risks include delays in medical evaluation due to technology failures, security breaches despite our robust encryption, or the need for an in-person evaluation if the provider deems it necessary.
          </p>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Your Rights</h2>
          <p>
            You have the right to withhold or withdraw your consent to telehealth at any time without affecting your right to future care or treatment. You also have the right to inspect all information obtained and recorded in the course of a telehealth interaction.
          </p>
        </div>
      </div>
    </div>
  );
}
