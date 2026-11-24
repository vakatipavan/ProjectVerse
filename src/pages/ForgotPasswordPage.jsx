import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Globe, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword, isFirebaseConfigured } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        await resetPassword(email);
      }
      setSubmitted(true);
      toast.success('Password reset instructions sent');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password — ProjectVerse</title>
      </Helmet>

      <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
        <div className="card w-full max-w-md p-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>

          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <span className="text-gradient">ProjectVerse</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
            <p className="text-slate-500 text-sm mt-1">Enter your registered email and we'll send a reset link</p>
          </div>

          {submitted ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800 mb-2">Check your inbox</p>
              <p className="text-xs text-slate-500 mb-6">
                If an account exists for {email}, you'll receive password reset instructions.
              </p>
              <Link to="/login" className="btn-primary w-full justify-center">
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
