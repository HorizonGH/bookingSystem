'use client';

import { useState } from 'react';

export function BookingForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    service: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking submitted:', formData);
    // Handle form submission
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section className="py-20 bg-white dark:bg-dark-light">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-dark dark:text-light">
              Book Your Appointment
            </h2>
            <p className="text-lg text-secondary-600 dark:text-secondary-300">
              Fill out the form below and we&apos;ll get back to you shortly
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-8 bg-light-darker dark:bg-dark rounded-2xl border border-light-darker dark:border-dark-light">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-dark-light text-dark dark:text-light focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-dark-light text-dark dark:text-light focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-dark-light text-dark dark:text-light focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-dark-light text-dark dark:text-light focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Service Type
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-dark-light text-dark dark:text-light focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select a service</option>
                    <option value="consultation">Consultation</option>
                    <option value="appointment">Standard Appointment</option>
                    <option value="meeting">Team Meeting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-cyan-glow-500 to-cyan-glow-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-glow-500/50 transition-all duration-300 hover:scale-[1.02]"
              >
                Submit Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
