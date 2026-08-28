import Link from 'next/link';
import { ArrowLeft, HeartPulse } from 'lucide-react';

export default function PrivacyPolicy() {
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
        
        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            This Privacy Policy describes how we collect, use, process, and disclose your information, including personal information, in conjunction with your access to and use of our platform. We are committed to protecting your privacy in compliance with HIPAA and other applicable healthcare regulations.
          </p>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you register for an account, fill out forms, or communicate with healthcare providers through our platform. This may include protected health information (PHI) which is handled with strict confidentiality.
          </p>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We use, store, and process information, including personal information, about you to provide, understand, improve, and develop our telehealth services, create and maintain a trusted and safer environment, and comply with our legal obligations.
          </p>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Data Security</h2>
          <p>
            We implement robust security measures designed to protect your personal information from unauthorized access. Our platform uses industry-standard encryption for all data transmission and storage to ensure your medical records remain secure.
          </p>
        </div>
      </div>
    </div>
  );
}
