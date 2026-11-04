import React, { useState } from 'react';
import { FiMail, FiMapPin, FiPhone, FiSend } from 'react-icons/fi';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Connect your submission logic or API here
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <section
      id="contact"
      className="relative w-full scroll-mt-20 py-24 px-6 md:px-12 bg-white overflow-hidden flex justify-center"
    >
      {/* Soft warm glow behind section */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#8D4624] blur-[140px] rounded-full pointer-events-none opacity-5"></div>

      <div className="relative z-10 max-w-6xl w-full flex flex-col items-center">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-normal italic font-playfair text-[#8D4624] drop-shadow-sm mb-6 tracking-tight">
            Get in Touch
          </h2>

          <div className="h-1 bg-gradient-to-r from-[#8D4624] to-[#C87A54] rounded-full mb-8 shadow-sm w-24"></div>

          <p className="text-[#4A3228] text-lg max-w-2xl font-medium opacity-85">
            Have questions about Saharohi AI or ready to grow your enterprise? We would love to hear from you.
          </p>
        </div>

        {/* Contact Content Grid */}
        <div className="flex justify-center w-full">
          {/* Left Column: Contact Information Cards */}
          <div className="w-full max-w-2xl flex flex-col gap-6">
            <div className="bg-[#FCFAF8] rounded-3xl border border-[#8D4624]/10 p-8 shadow-sm">
              <h3 className="text-2xl font-playfair italic text-[#8D4624] mb-3">
                Let's Build Together
              </h3>
              <p className="text-[#4A3228] text-sm md:text-base leading-relaxed mb-8 opacity-90">
                Whether you are seeking mentorship, need platform guidance, or are exploring enterprise collaborations, our team is here for you.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#8D4624]/15 shadow-sm flex items-center justify-center shrink-0 text-[#8D4624]">
                    <FiMail className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-[#8D4624]">
                      Email Us
                    </h4>
                    <a
                      href="mailto:hello@sarahi.com"
                      className="text-base font-medium text-[#4A3228] hover:text-[#8D4624] transition-colors"
                    >
                      hello@sarahi.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#8D4624]/15 shadow-sm flex items-center justify-center shrink-0 text-[#8D4624]">
                    <FiPhone className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-[#8D4624]">
                      Call Us
                    </h4>
                    <span className="text-base font-medium text-[#4A3228]">
                      +91 (080) 4567-8900
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#8D4624]/15 shadow-sm flex items-center justify-center shrink-0 text-[#8D4624]">
                    <FiMapPin className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-[#8D4624]">
                      Headquarters
                    </h4>
                    <p className="text-base font-medium text-[#4A3228]">
                      Innovation Hub, Bengaluru, India
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          {/* <div className="lg:col-span-7 bg-[#FCFAF8] rounded-3xl border border-[#8D4624]/10 p-8 md:p-10 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#8D4624] mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-white border border-[#8D4624]/15 rounded-2xl text-[#4A3228] placeholder-[#4A3228]/40 focus:outline-none focus:ring-2 focus:ring-[#8D4624]/30 focus:border-[#8D4624] transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#8D4624] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@domain.com"
                    className="w-full px-4 py-3 bg-white border border-[#8D4624]/15 rounded-2xl text-[#4A3228] placeholder-[#4A3228]/40 focus:outline-none focus:ring-2 focus:ring-[#8D4624]/30 focus:border-[#8D4624] transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8D4624] mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 bg-white border border-[#8D4624]/15 rounded-2xl text-[#4A3228] placeholder-[#4A3228]/40 focus:outline-none focus:ring-2 focus:ring-[#8D4624]/30 focus:border-[#8D4624] transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8D4624] mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project or inquiry..."
                  className="w-full px-4 py-3 bg-white border border-[#8D4624]/15 rounded-2xl text-[#4A3228] placeholder-[#4A3228]/40 focus:outline-none focus:ring-2 focus:ring-[#8D4624]/30 focus:border-[#8D4624] transition-all duration-200 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium text-white bg-[#8D4624] hover:bg-[#73371b] rounded-full shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span>Send Message</span>
                <FiSend className="text-base" />
              </button>

              {submitted && (
                <p className="text-sm font-medium text-green-700 animate-fade-in">
                  Thank you! Your message has been received.
                </p>
              )}
            </form>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default Contact;