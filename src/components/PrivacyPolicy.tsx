import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">Effective Date: April 16, 2025</p>
      <p className="mb-4">
        At Yup, That Works, we value your privacy. This Privacy Policy outlines the types of information we collect, how we use it, and the steps we take to ensure your information is protected.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Information We Collect</h2>
      <p className="mb-4">
        We may collect personal information such as your name, email address, and any other details you provide when signing up or using our services. Additionally, we collect non-personal information such as browser type, device information, and usage data to improve our services.
      </p>
      <h2 className="text-2xl font-semibold mb-2">How We Use Your Information</h2>
      <p className="mb-4">
        The information we collect is used to provide and improve our services, communicate with you, and ensure the security of our platform. We do not sell or share your personal information with third parties without your consent, except as required by law.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Your Rights</h2>
      <p className="mb-4">
        You have the right to access, update, or delete your personal information. If you have any questions or concerns about your privacy, please contact us at <a href="mailto:support@yupthatworks.com" className="text-blue-500 underline">support@yupthatworks.com</a>.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Changes to This Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.
      </p>
    </div>
  );
};

export default PrivacyPolicy;