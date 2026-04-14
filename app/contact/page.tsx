"use client";

import React, { useState } from 'react';
import { useToast } from "../../context-and-provider";

export default function ContactPage() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;
    setIsSending(true);
    try {

      await new Promise((res) => setTimeout(res, 600));
      showToast('Message sent successfully', 'success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('Contact form submit error', err);
      showToast('Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden grid md:grid-cols-2">
          <div className="p-10 bg-green-100 text-black">
            <h1 className="text-4xl font-extrabold mb-4">Get in touch</h1>
            <p className="mb-6 text-grey-900">Questions, feedback or need help with Tickr? Our team is here to help.</p>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Email</h3>
                <p className="text-sm text-grey-900">support@tickrapp.com</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Phone</h3>
                <p className="text-sm text-grey-900">+977 (000) 000-0000</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Support Hours</h3>
                <p className="text-sm text-grey-900">Mon–Fri, 10:00 AM–6:00 PM (NPT)</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Your name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-200 rounded-md p-2" placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border border-gray-200 rounded-md p-2" placeholder="Your Email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 block w-full border border-gray-200 rounded-md p-2" placeholder="How can we help?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 block w-full border border-gray-200 rounded-md p-2 h-32" placeholder="Type your message..." />
              </div>
              <div className="flex items-center justify-between">
                <button type="submit" disabled={isSending} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {isSending ? 'Sending...' : 'Send message'}
                </button>
                <div className="text-sm text-gray-500">Or email us directly at <a href="mailto:support@tickrapp.com" className="text-blue-600">support@tickrapp.com</a></div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
