import React, { useState } from 'react';
import { api } from '../services/api';
import { Send, CheckCircle2, AlertCircle, Sparkles, BookOpen, User, Mail, Phone, MessageSquare } from 'lucide-react';

const COURSES = [
  'Full Stack Web Development (MERN)',
  'Backend Engineering (Node.js & Microservices)',
  'Frontend Architecture (React & Next.js)',
  'Cloud DevOps & System Design',
  'Data Science & Artificial Intelligence'
];

export default function PublicEnquiryForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    courseInterest: COURSES[0],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.enquiries.submit(formData);
      setSuccessData(res.enquiry);
      setFormData({
        name: '',
        email: '',
        phone: '',
        courseInterest: COURSES[0],
        notes: ''
      });
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to submit enquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
      {/* Intro Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Public Admission & Lead Capture Form</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Start Your Tech Career With Us
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Fill out this quick enquiry form. A dedicated academic counselor will review your request and get in touch with curriculum & scholarship details.
        </p>
      </div>

      {/* Success Notification */}
      {successData && (
        <div className="mb-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm animate-fade-in">
          <div className="flex items-start space-x-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-lg text-emerald-900">Enquiry Submitted Successfully!</h3>
              <p className="text-sm text-emerald-800 mt-1">
                Thank you, <span className="font-semibold">{successData.name}</span>! Your enquiry for{' '}
                <span className="font-semibold">{successData.courseInterest}</span> has been captured as an unclaimed public lead. An admissions counselor can now claim and attend to your request.
              </p>
              <div className="mt-3 text-xs text-emerald-700 bg-white/70 p-2.5 rounded-lg border border-emerald-200 inline-block font-mono">
                Enquiry Reference ID: {successData._id}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSuccessData(null)}
            className="mt-4 text-xs font-semibold text-emerald-700 underline hover:text-emerald-900"
          >
            Submit Another Response
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 text-sm transition"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                placeholder="rahul@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 text-sm transition"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 text-sm transition"
              />
            </div>
          </div>

          {/* Course Interest */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Course of Interest <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <select
                value={formData.courseInterest}
                onChange={(e) => setFormData({ ...formData, courseInterest: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 text-sm bg-white transition"
              >
                {COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes / Message */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Questions or Specific Interests
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <textarea
                rows={3}
                placeholder="Tell us about your educational background or preferred timings..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 text-sm transition resize-none"
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition disabled:opacity-60 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Submitting Enquiry...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Enquiry</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>We keep your information strictly confidential</span>
          <span>A counselor will reach out within 24 hours</span>
        </div>
      </div>
    </div>
  );
}
