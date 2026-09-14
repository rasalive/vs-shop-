import React from "react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
      <h1 className="text-2xl sm:text-3xl font-black text-white font-mono mb-4">
        PRIVACY POLICY
      </h1>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
        <p>
          We only collect information necessary to securely deliver your digital goods and communicate order status, including your account email, encrypted password hash, and optional WhatsApp phone number.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">2. Payment & Credential Security</h2>
        <p>
          We do not store full credit card numbers or payment card details on our servers. Transactions are handled directly via PCI-DSS compliant providers (Stripe, Razorpay, PayPal). Your provisioned credentials in the Digital Vault are stored with strict access controls.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">3. Third-Party Sharing</h2>
        <p>
          We will never sell, rent, or trade your personal information or purchase history with third-party advertising networks.
        </p>
      </section>
    </div>
  );
}
