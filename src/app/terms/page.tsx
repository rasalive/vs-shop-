import React from "react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
      <h1 className="text-2xl sm:text-3xl font-black text-white font-mono mb-4">
        TERMS OF SERVICE
      </h1>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">1. Overview</h2>
        <p>
          By accessing and purchasing from Vortex Marketplace (&quot;the Platform&quot;), you agree to abide by these Terms of Service. Vortex provides digital key provisioning, verified accounts, and subscription management services.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">2. Delivery Policy</h2>
        <p>
          Digital keys and credentials are automatically provisioned into your personal encrypted Digital Vault upon successful payment verification. For WhatsApp Direct orders, status is marked as PENDING until verified by our sales desk.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">3. Replacement Warranty Guarantee</h2>
        <p>
          All products come with our verified replacement guarantee. If a key is invalid or an account credential fails to log in, you must notify our Support Desk within the designated warranty period to receive an automated or manual replacement.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">4. Prohibited Activities</h2>
        <p>
          Attempts to exploit, resell unauthorized keys, dispute verified deliveries in bad faith, or abuse staff will result in immediate account suspension and banning from the Vortex network.
        </p>
      </section>
    </div>
  );
}
