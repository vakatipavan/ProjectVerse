import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, CheckCircle, XCircle, AlertTriangle, Layers,
  Users, Check, X, ExternalLink, Flag, Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getPendingProjects, approveProject, rejectProject,
  getAdminStats, getProjects
} from '../services/firestore';
import { DEMO_CATEGORIES } from '../data/sampleData';
import { PageLoader, EmptyState } from '../components/ui/LoadingStates';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalProjects: 0, totalUsers: 0, pending: 0, approved: 0, rejected: 0 });
  const [pendingProjects, setPendingProjects] = useState([]);
  const [approvedProjects, setApprovedProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, categories, reports
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [projectToReject, setProjectToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      // In demo mode or non-admin, warn or redirect
      // Allow viewing demo admin view for review purposes if user wants to inspect
    }

    async function loadData() {
      setLoading(true);
      try {
        const [statRes, pendingList, approvedList] = await Promise.all([
          getAdminStats(),
          getPendingProjects(),
          getProjects({ pageSize: 50, approvedOnly: true }),
        ]);
        setStats(statRes);
        setPendingProjects(pendingList);
        setApprovedProjects(approvedList.projects);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAdmin]);

  const handleApprove = async (id) => {
    try {
      await approveProject(id);
      toast.success('Project approved and is now public!');
      setPendingProjects(prev => prev.filter(p => p.id !== id));
      setStats(prev => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }));
    } catch {
      toast.error('Failed to approve project');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please specify a rejection reason');
      return;
    }
    try {
      await rejectProject(projectToReject.id, rejectionReason);
      toast.success('Project submission rejected');
      setPendingProjects(prev => prev.filter(p => p.id !== projectToReject.id));
      setStats(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }));
      setRejectModalOpen(false);
      setProjectToReject(null);
      setRejectionReason('');
    } catch {
      toast.error('Failed to reject project');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Admin Moderation Dashboard — ProjectVerse</title>
      </Helmet>

      <div className="container-page py-10 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge bg-purple-100 text-purple-700 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Staff Moderation
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Administrator Console</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Review submitted problem-solving innovations, manage categories, and enforce platform quality
            </p>
          </div>
          <Link to="/explore" className="btn-secondary text-sm">
            View Live Site
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending Review', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Approved Live', value: stats.approved, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Total Projects', value: stats.totalProjects, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Registered Users', value: stats.totalUsers, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(kpi => (
            <div key={kpi.label} className="card p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
              <div className={`text-3xl font-extrabold mt-1 ${kpi.color}`}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Pending Approvals ({pendingProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'approved' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Live Projects ({approvedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'categories' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Categories ({DEMO_CATEGORIES.length})
          </button>
        </div>

        {/* Tab 1: Pending Approvals */}
        {activeTab === 'pending' && (
          <div>
            {pendingProjects.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="All caught up!"
                description="There are currently no submissions awaiting moderation review."
              />
            ) : (
              <div className="space-y-4">
                {pendingProjects.map(proj => (
                  <div key={proj.id} className="card p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="badge bg-amber-50 text-amber-700 text-xs">Pending Review</span>
                        <span className="badge bg-blue-50 text-blue-700 text-xs">{proj.categoryName || proj.category}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{proj.name}</h3>
                      <p className="text-sm text-slate-600">{proj.shortDescription}</p>

                      <div className="bg-gray-50 p-3 rounded-xl text-xs space-y-1">
                        <div><strong>Problem:</strong> {proj.problemStatement}</div>
                        <div><strong>Solution:</strong> {proj.proposedSolution}</div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
                        <span>Submitted by: <strong>{proj.creatorName}</strong></span>
                        {proj.liveUrl && (
                          <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                            Live Demo <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {proj.githubUrl && (
                          <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-slate-700 hover:underline inline-flex items-center gap-1">
                            GitHub <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleApprove(proj.id)}
                        className="btn-primary text-sm flex-1 sm:flex-none justify-center bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => { setProjectToReject(proj); setRejectModalOpen(true); }}
                        className="btn-secondary text-sm flex-1 sm:flex-none justify-center text-red-600 hover:bg-red-50 border-red-200"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Approved Projects */}
        {activeTab === 'approved' && (
          <div className="space-y-4">
            {approvedProjects.map(p => (
              <div key={p.id} className="card p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-600 flex-shrink-0">
                    {p.name[0]}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate">{p.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{p.categoryName} · by {p.creatorName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/projects/${p.id}`} className="btn-secondary text-xs px-3 py-1.5">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Categories */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMO_CATEGORIES.map(cat => (
              <div key={cat.id} className="card p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{cat.name}</h4>
                  <p className="text-xs text-slate-500">{cat.description}</p>
                </div>
                <span className="badge bg-blue-50 text-blue-700">Active</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md animate-slide-up">
            <h3 className="font-bold text-slate-900 text-lg mb-1">Reject Submission</h3>
            <p className="text-sm text-slate-500 mb-4">
              Please provide feedback explaining why "{projectToReject?.name}" cannot be published.
            </p>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="e.g. Duplicate project, broken links, or insufficient problem description..."
              className="input resize-none mb-4"
              required
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectModalOpen(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleReject} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
