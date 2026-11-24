import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — ProjectVerse</title>
      </Helmet>

      <div className="min-h-[60vh] flex items-center justify-center py-20 px-4 text-center">
        <div>
          <Compass className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin-slow" />
          <h1 className="text-5xl font-extrabold text-slate-900 mb-2">404</h1>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Page Not Found</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            The page you're searching for does not exist or has been moved to a different discovery path.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/" className="btn-primary">
              <ArrowLeft className="w-4 h-4" /> Return Home
            </Link>
            <Link to="/find-solutions" className="btn-secondary">
              Find Solutions
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
