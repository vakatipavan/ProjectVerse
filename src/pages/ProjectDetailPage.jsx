import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ExternalLink, Heart, Bookmark, Share2, Flag, Users,
  Eye, ArrowLeft, CheckCircle, Clock, Zap, Tag, User, Calendar
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getProjectById, incrementProjectViews, toggleLike, toggleBookmark, isProjectLiked, reportProject, sendCollaborationRequest } from '../services/firestore';
import { DEMO_PROJECTS } from '../data/sampleData';
import ProjectCard from '../components/projects/ProjectCard';
import { PageLoader } from '../components/ui/LoadingStates';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const statusIcons = { 'Active': Zap, 'Completed': CheckCircle, 'Under Development': Clock };
const statusColors = { 'Active': 'text-green-600 bg-green-50', 'Completed': 'text-blue-600 bg-blue-50', 'Under Development': 'text-amber-600 bg-amber-50' };

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [similarProjects, setSimilarProjects] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCollab, setShowCollabModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [collabMessage, setCollabMessage] = useState('');
  const viewCounted = useRef(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const p = await getProjectById(id);
        setProject(p);
        setLikeCount(p?.likes || 0);
        if (!viewCounted.current) {
          viewCounted.current = true;
          incrementProjectViews(id);
        }
        // Find similar projects from demo data
        const similar = DEMO_PROJECTS.filter(dp => dp.id !== id && dp.category === p?.category).slice(0, 3);
        setSimilarProjects(similar);
        if (currentUser && p) {
          const liked = await isProjectLiked(id, currentUser.uid);
          setLiked(liked);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) { toast.error('Sign in to like projects'); return; }
    try {
      const { liked: newLiked } = await toggleLike(id, currentUser.uid);
      setLiked(newLiked);
      setLikeCount(c => newLiked ? c + 1 : c - 1);
      toast.success(newLiked ? 'Added to liked projects' : 'Removed from likes');
    } catch (err) {
      toast.error('Failed to update like');
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) { toast.error('Sign in to save projects'); return; }
    try {
      const { bookmarked: newBookmarked } = await toggleBookmark(id, currentUser.uid);
      setBookmarked(newBookmarked);
      toast.success(newBookmarked ? 'Project saved' : 'Removed from saved');
    } catch {
      toast.error('Failed to save project');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: project?.name, text: project?.shortDescription, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleReport = async () => {
    if (!currentUser) { toast.error('Sign in to report projects'); return; }
    if (!reportReason.trim()) { toast.error('Please provide a reason'); return; }
    try {
      await reportProject(id, currentUser.uid, reportReason);
      toast.success('Report submitted. Thank you!');
      setShowReportModal(false);
      setReportReason('');
    } catch {
      toast.error('Failed to submit report');
    }
  };

  const handleCollabRequest = async () => {
    if (!currentUser) { toast.error('Sign in to request collaboration'); return; }
    if (!collabMessage.trim()) { toast.error('Please write a message'); return; }
    try {
      await sendCollaborationRequest(id, currentUser.uid, collabMessage);
      toast.success('Collaboration request sent!');
      setShowCollabModal(false);
      setCollabMessage('');
    } catch {
      toast.error('Failed to send request');
    }
  };

  if (loading) return <PageLoader />;
  if (!project) return (
    <div className="container-page py-20 text-center">
      <h2 className="text-2xl font-bold text-slate-900 mb-3">Project Not Found</h2>
      <p className="text-slate-500 mb-6">This project may have been removed or doesn't exist.</p>
      <Link to="/explore" className="btn-primary">Browse Projects</Link>
    </div>
  );

  const StatusIcon = statusIcons[project.status] || Zap;
  const statusClass = statusColors[project.status] || 'text-gray-600 bg-gray-50';
  const createdDate = project.createdAt?.toDate ? project.createdAt.toDate() : (project.createdAt ? new Date(project.createdAt) : null);

  return (
    <>
      <Helmet>
        <title>{project.name} — ProjectVerse</title>
        <meta name="description" content={project.shortDescription} />
        <meta property="og:title" content={`${project.name} — ProjectVerse`} />
        <meta property="og:description" content={project.shortDescription} />
        {project.thumbnail && <meta property="og:image" content={project.thumbnail} />}
        <link rel="canonical" href={`https://projectverse.dev/projects/${project.id}`} />
      </Helmet>

      <div className="container-page py-10">
        {/* Back link */}
        <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover image */}
            {project.thumbnail && (
              <div className="rounded-2xl overflow-hidden h-72 md:h-96">
                <img src={project.thumbnail} alt={`${project.name} screenshot`} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Title & badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`badge ${statusClass} flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" /> {project.status}
                </span>
                <span className="badge bg-blue-50 text-blue-700">{project.categoryName}</span>
                {project.isDemo && (
                  <span className="badge bg-gray-100 text-gray-500">Demo Project</span>
                )}
                {project.openForCollaboration && (
                  <span className="badge bg-green-50 text-green-700 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Open for Collaboration
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">{project.name}</h1>
              <p className="text-lg text-slate-600 leading-relaxed">{project.shortDescription}</p>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-3">About the Project</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{project.description}</p>
            </div>

            {/* Problem & Solution */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs text-red-600 font-bold">!</span>
                  Problem
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{project.problemStatement}</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs text-green-600 font-bold">✓</span>
                  Solution
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{project.proposedSolution}</p>
              </div>
            </div>

            {/* Technologies */}
            {project.technologies?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" /> Technologies Used
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(tech => (
                    <span key={tech} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-xl border border-blue-100">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {project.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <Link
                    key={tag}
                    to={`/explore?q=${encodeURIComponent(tag)}`}
                    className="text-sm text-slate-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-3 py-1 rounded-full transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Similar Projects */}
            {similarProjects.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-5">Similar Projects</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {similarProjects.map(p => <ProjectCard key={p.id} project={p} />)}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Primary CTA */}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full justify-center py-3 text-base"
              >
                <ExternalLink className="w-5 h-5" /> Visit Live Project
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full justify-center py-3"
              >
                <GithubIcon className="w-5 h-5" /> View Source Code
              </a>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleLike}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border font-semibold text-sm transition-all ${liked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-slate-600 hover:border-red-200 hover:text-red-600'}`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} /> {likeCount}
              </button>
              <button
                onClick={handleBookmark}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border font-semibold text-sm transition-all ${bookmarked ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-slate-600 hover:border-blue-200 hover:text-blue-600'}`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-blue-600' : ''}`} /> Save
              </button>
              <button onClick={handleShare} className="flex items-center justify-center p-2.5 rounded-xl border border-gray-200 text-slate-600 hover:border-blue-200 hover:text-blue-600 transition-all bg-white">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Creator Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Creator
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-violet-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {project.creatorName?.[0] || 'C'}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{project.creatorName}</div>
                  {project.organization && <div className="text-xs text-slate-500">{project.organization}</div>}
                </div>
              </div>
              {project.openForCollaboration && (
                <button
                  onClick={() => setShowCollabModal(true)}
                  className="w-full btn-primary justify-center py-2 text-sm mt-2"
                >
                  <Users className="w-4 h-4" /> Request Collaboration
                </button>
              )}
            </div>

            {/* Project Info */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h3 className="font-bold text-slate-900 mb-4">Project Info</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Type</dt>
                  <dd className="font-medium text-slate-800">{project.projectType}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="font-medium text-slate-800">{project.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Views</dt>
                  <dd className="font-medium text-slate-800 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {project.views || 0}</dd>
                </div>
                {createdDate && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Added</dt>
                    <dd className="font-medium text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />{formatDistanceToNow(createdDate, { addSuffix: true })}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Report */}
            <button
              onClick={() => setShowReportModal(true)}
              className="text-sm text-slate-400 hover:text-red-500 flex items-center gap-1.5 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" /> Report this project
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowReportModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 text-lg mb-1">Report Project</h3>
            <p className="text-sm text-slate-500 mb-4">Help us keep ProjectVerse accurate and trustworthy.</p>
            <label className="label">Reason for reporting</label>
            <textarea value={reportReason} onChange={e => setReportReason(e.target.value)} rows={3} placeholder="Broken link, misleading content, duplicate..." className="input resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowReportModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleReport} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors">Submit Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Modal */}
      {showCollab && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCollabModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 text-lg mb-1">Request Collaboration</h3>
            <p className="text-sm text-slate-500 mb-4">Introduce yourself and explain how you'd like to contribute.</p>
            <label className="label">Your Message</label>
            <textarea value={collabMessage} onChange={e => setCollabMessage(e.target.value)} rows={4} placeholder="Hi! I'm interested in collaborating because..." className="input resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowCollabModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleCollabRequest} className="btn-primary flex-1 justify-center">Send Request</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
