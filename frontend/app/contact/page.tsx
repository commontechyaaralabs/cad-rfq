"use client";
import { Header } from "@/components/Header";
import { useState } from "react";

// YAARALABS Brand Colors
const BRAND = {
  black: '#010101',
  magenta: '#B90ABD',
  lightGray: '#D6D9D8',
  purple: '#5332FF',
  white: '#FFFFFF',
  gray: '#939394',
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to an API
    console.log("Form submitted:", formData);
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: BRAND.white }}>
      <Header />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-16" style={{ background: `linear-gradient(135deg, ${BRAND.magenta}, ${BRAND.purple})` }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: BRAND.white }}>Get in Touch</h1>
            <p className="text-xl" style={{ color: `${BRAND.white}dd` }}>
              Have questions about our platform? We&apos;d love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold mb-6" style={{ color: BRAND.black }}>Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${BRAND.magenta}15`, color: BRAND.magenta }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: BRAND.black }}>Email</h3>
                      <p style={{ color: BRAND.gray }}>hello@yaaralabs.ai</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${BRAND.magenta}15`, color: BRAND.magenta }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: BRAND.black }}>Location</h3>
                      <p style={{ color: BRAND.gray }}>Chennai, India</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${BRAND.magenta}15`, color: BRAND.magenta }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: BRAND.black }}>Business Hours</h3>
                      <p style={{ color: BRAND.gray }}>Monday - Friday: 9:00 AM - 6:00 PM IST</p>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="mt-10">
                  <h3 className="font-semibold mb-4" style={{ color: BRAND.black }}>Quick Links</h3>
                  <div className="flex flex-wrap gap-2">
                    <a href="/vendor-rfq-comparison" className="px-4 py-2 rounded-lg text-sm transition-colors" style={{ backgroundColor: BRAND.lightGray, color: BRAND.black }}>
                      Try Vendor Comparison
                    </a>
                    <a href="/rfq-cad-comparison" className="px-4 py-2 rounded-lg text-sm transition-colors" style={{ backgroundColor: BRAND.lightGray, color: BRAND.black }}>
                      Try CAD Validation
                    </a>
                    <a href="/about" className="px-4 py-2 rounded-lg text-sm transition-colors" style={{ backgroundColor: BRAND.lightGray, color: BRAND.black }}>
                      About Us
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="rounded-2xl shadow-lg border p-8" style={{ backgroundColor: BRAND.white, borderColor: BRAND.lightGray }}>
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${BRAND.magenta}15`, color: BRAND.magenta }}>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: BRAND.black }}>Message Sent!</h3>
                    <p className="mb-6" style={{ color: BRAND.gray }}>Thank you for reaching out. We&apos;ll get back to you soon.</p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: "", email: "", company: "", message: "" });
                      }}
                      className="font-medium hover:underline"
                      style={{ color: BRAND.magenta }}
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-xl font-bold mb-2" style={{ color: BRAND.black }}>Send us a Message</h2>
                    <p className="text-sm mb-6" style={{ color: BRAND.gray }}>Fill out the form below and we&apos;ll respond within 24 hours.</p>
                    
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: BRAND.black }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: BRAND.lightGray, '--tw-ring-color': BRAND.magenta } as React.CSSProperties}
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: BRAND.black }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: BRAND.lightGray }}
                        placeholder="john@company.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium mb-1" style={{ color: BRAND.black }}>
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: BRAND.lightGray }}
                        placeholder="Your Company"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-1" style={{ color: BRAND.black }}>
                        Message *
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
                        style={{ borderColor: BRAND.lightGray }}
                        placeholder="Tell us how we can help..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full px-6 py-3 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg hover:opacity-90"
                      style={{ backgroundColor: BRAND.magenta }}
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8" style={{ backgroundColor: BRAND.black, color: BRAND.white }}>
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-sm" style={{ color: BRAND.gray }}>
              © {new Date().getFullYear()} YAARALABS. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
