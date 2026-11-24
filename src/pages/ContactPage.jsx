import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please complete all required fields');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      toast.success('Your message has been sent!');
    }, 800);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us — ProjectVerse</title>
      </Helmet>

      <div className="container-page py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="section-heading mb-3">Get in Touch</h1>
          <p className="text-slate-500 text-lg">
            Have questions about ProjectVerse, partnership inquiries, or suggestions? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="card p-6">
              <Mail className="w-6 h-6 text-blue-600 mb-3" />
              <h3 className="font-bold text-slate-900 mb-1">Email Us</h3>
              <p className="text-slate-500 text-sm mb-2">Direct inquiries & support</p>
              <a href="mailto:hello@projectverse.dev" className="text-sm font-semibold text-blue-600 hover:underline">
                hello@projectverse.dev
              </a>
            </div>

            <div className="card p-6">
              <MessageSquare className="w-6 h-6 text-purple-600 mb-3" />
              <h3 className="font-bold text-slate-900 mb-1">Community</h3>
              <p className="text-slate-500 text-sm mb-2">Connect with other innovators</p>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">
                GitHub Community
              </a>
            </div>
          </div>

          <div className="md:col-span-2 card p-8">
            {sent ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Message Received</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                  Thank you for reaching out. A member of the ProjectVerse team will respond shortly.
                </p>
                <button onClick={() => { setSent(false); setFormData({ name: '', email: '', subject: '', message: '' }); }} className="btn-secondary">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Your Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="input"
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Your Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="input"
                      placeholder="jane@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                    className="input"
                    placeholder="Inquiry or feedback topic"
                  />
                </div>

                <div>
                  <label className="label">Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                    rows={4}
                    className="input resize-none"
                    placeholder="How can we assist you?"
                    required
                  />
                </div>

                <button type="submit" disabled={sending} className="btn-primary w-full justify-center">
                  <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
