import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User, Briefcase, Bookmark, Plus, Edit2, ExternalLink, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProjects, getUserBookmarks, getProjects, updateUserProfile } from '../services/firestore';
import ProjectCard from '../components/projects/ProjectCard';
import { PageLoader, EmptyState } from '../components/ui/LoadingStates';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { currentUser, userProfile, fetchUserProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('published'); // published, saved, edit
  const [publishedProjects, setPublishedProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editOrg, setEditOrg] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    async function loadData() {
      setLoading(true);
      try {
        const myProjects = await getUserProjects(currentUser.uid);
        setPublishedProjects(myProjects);

        const bookmarkIds = await getUserBookmarks(currentUser.uid);
        if (bookmarkIds.length > 0) {
          const allRes = await getProjects({ pageSize: 100 });
          setSavedProjects(allRes.projects.filter(p => bookmarkIds.includes(p.id)));
        } else {
          setSavedProjects([]);
        }

        // populate edit fields
        setEditName(userProfile?.name || currentUser.displayName || '');
        setEditBio(userProfile?.bio || '');
        setEditOrg(userProfile?.organization || '');
        setEditSkills((userProfile?.skills || []).join(', '));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentUser, userProfile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const skillsArray = editSkills.split(',').map(s => s.trim()).filter(Boolean);
      await updateUserProfile(currentUser.uid, {
        name: editName,
        bio: editBio,
        organization: editOrg,
        skills: skillsArray,
      });
      await fetchUserProfile(currentUser.uid);
      toast.success('Profile updated successfully');
      setActiveTab('published');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (!currentUser) return null;
  if (loading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>User Profile — ProjectVerse</title>
      </Helmet>

      <div className="container-page py-10 max-w-5xl">
        {/* Header Profile Card */}
        <div className="card p-8 mb-8 bg-gradient-to-r from-blue-50/50 to-violet-50/50">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md flex-shrink-0">
              {(userProfile?.name || currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">
                    {userProfile?.name || currentUser.displayName || 'ProjectVerse Innovator'}
                  </h1>
                  <p className="text-slate-500 text-sm">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => setActiveTab('edit')}
                  className="btn-secondary text-sm self-center sm:self-start"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </div>

              {userProfile?.organization && (
                <p className="text-sm text-slate-600 font-medium mt-2 flex items-center justify-center sm:justify-start gap-1">
                  <Briefcase className="w-4 h-4 text-slate-400" /> {userProfile.organization}
                </p>
              )}

              {userProfile?.bio && (
                <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                  {userProfile.bio}
                </p>
              )}

              {userProfile?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 justify-center sm:justify-start">
                  {userProfile.skills.map(s => (
                    <span key={s} className="badge bg-white text-slate-700 border border-gray-200">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('published')}
            className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'published' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            My Submissions ({publishedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'saved' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Saved Solutions ({savedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'edit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Account Settings
          </button>
        </div>

        {/* Tab 1: Published */}
        {activeTab === 'published' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Your Projects</h2>
              <Link to="/submit" className="btn-primary text-sm">
                <Plus className="w-4 h-4" /> Submit Another Project
              </Link>
            </div>
            {publishedProjects.length === 0 ? (
              <EmptyState
                title="No published projects yet"
                description="Share your website, app, or tool to connect with people facing real challenges."
                action={
                  <Link to="/submit" className="btn-primary">
                    Submit a Project
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedProjects.map(p => (
                  <div key={p.id} className="relative group">
                    <ProjectCard project={p} />
                    <div className="absolute top-2 left-2 z-10">
                      <span className={`badge ${p.approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {p.approved ? 'Live' : 'Pending Review'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved */}
        {activeTab === 'saved' && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Bookmarked Solutions</h2>
            {savedProjects.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="No saved projects"
                description="Click the bookmark icon on any project card or detail page to save solutions here."
                action={
                  <Link to="/explore" className="btn-primary">
                    Explore Solutions
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProjects.map(p => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Edit */}
        {activeTab === 'edit' && (
          <div className="card p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="label">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">College or Organization</label>
                <input
                  type="text"
                  value={editOrg}
                  onChange={e => setEditOrg(e.target.value)}
                  placeholder="e.g. Stanford University or Tech Startup"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Bio</label>
                <textarea
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  rows={3}
                  placeholder="A few words about yourself, interests, and what you build..."
                  className="input resize-none"
                />
              </div>

              <div>
                <label className="label">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={editSkills}
                  onChange={e => setEditSkills(e.target.value)}
                  placeholder="React, Python, Machine Learning, UI/UX"
                  className="input"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setActiveTab('published')} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={savingProfile} className="btn-primary">
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
