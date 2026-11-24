import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { UploadCloud, CheckCircle2, AlertCircle, ArrowLeft, Plus, X } from 'lucide-react';
import { submitProject } from '../services/firestore';
import { DEMO_CATEGORIES } from '../data/sampleData';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const PROJECT_TYPES = [
  'Web Application',
  'Mobile Application',
  'Desktop Application',
  'SaaS',
  'API / Backend',
  'IoT / Hardware',
  'Other'
];

const STATUS_OPTIONS = ['Active', 'Completed', 'Under Development'];

export default function SubmitProjectPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    problemStatement: '',
    proposedSolution: '',
    category: 'technology',
    projectType: 'Web Application',
    status: 'Active',
    liveUrl: '',
    githubUrl: '',
    creatorName: currentUser?.displayName || '',
    organization: '',
    openForCollaboration: true,
  });

  const [technologies, setTechnologies] = useState(['React', 'Node.js']);
  const [techInput, setTechInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTech = (e) => {
    e.preventDefault();
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies(prev => [...prev, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (techToRemove) => {
    setTechnologies(prev => prev.filter(t => t !== techToRemove));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be under 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('Please sign in to submit a project');
      navigate('/login');
      return;
    }

    if (!formData.name.trim()) return toast.error('Project Name is required');
    if (!formData.shortDescription.trim()) return toast.error('Short Description is required');
    if (!formData.description.trim()) return toast.error('Detailed Description is required');
    if (!formData.problemStatement.trim()) return toast.error('Problem Statement is required');
    if (!formData.proposedSolution.trim()) return toast.error('Proposed Solution is required');
    if (!formData.creatorName.trim()) return toast.error('Creator Name is required');
    if (technologies.length === 0) return toast.error('At least one technology is required');

    if (formData.liveUrl && !validateUrl(formData.liveUrl)) {
      return toast.error('Please enter a valid Live Website URL (include https://)');
    }
    if (formData.githubUrl && !validateUrl(formData.githubUrl)) {
      return toast.error('Please enter a valid GitHub Repository URL (include https://)');
    }

    setSubmitting(true);
    try {
      const selectedCat = DEMO_CATEGORIES.find(c => c.id === formData.category);
      const projectPayload = {
        ...formData,
        categoryName: selectedCat ? selectedCat.name : 'Technology & AI',
        technologies,
        thumbnail: imagePreview || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
        tags: [formData.category, ...technologies.map(t => t.toLowerCase())],
      };

      await submitProject(projectPayload, imageFile, currentUser.uid);
      setSubmittedSuccess(true);
      toast.success('Project submitted for review!');
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(err.message || 'Failed to submit project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="container-page py-20 max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Project Submitted Successfully!</h1>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Your project has been recorded with status <strong className="text-amber-600">"Pending Review"</strong>.
          To maintain quality and avoid misleading listings, our team verifies submissions before they become publicly discoverable.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/explore" className="btn-primary">
            Explore Other Projects
          </Link>
          <Link to="/profile" className="btn-secondary">
            View My Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Submit a Project — ProjectVerse</title>
        <meta name="description" content="Publish your website, application, or software innovation on ProjectVerse to connect with problem solvers and collaborators." />
      </Helmet>

      <div className="container-page py-10 max-w-4xl mx-auto">
        <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>

        <div className="mb-8">
          <h1 className="section-heading mb-2">Submit Your Project</h1>
          <p className="text-slate-500">
            Share your innovation with a global audience searching for solutions to real-world problems.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          {/* Section: Basic Info */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">1. Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="label">Project Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. AgroSense, MediConnect, GreenTrace"
                  className="input"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Short Description (Summary) *</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="A one-line punchy summary of what your project achieves (max 150 chars)"
                  className="input"
                  maxLength={160}
                  required
                />
              </div>

              <div>
                <label className="label">Category *</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="input">
                  {DEMO_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Project Type *</label>
                <select name="projectType" value={formData.projectType} onChange={handleInputChange} className="input">
                  {PROJECT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Project Status *</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="input">
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Open for Collaboration?</label>
                <div className="flex items-center gap-3 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input
                      type="radio"
                      name="openForCollaboration"
                      checked={formData.openForCollaboration === true}
                      onChange={() => setFormData(p => ({ ...p, openForCollaboration: true }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Yes, looking for teammates / contributors
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 ml-4">
                    <input
                      type="radio"
                      name="openForCollaboration"
                      checked={formData.openForCollaboration === false}
                      onChange={() => setFormData(p => ({ ...p, openForCollaboration: false }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    No, solo or completed
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Problem & Solution Discovery Anchor */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">2. Problem & Solution Context</h2>
            <div className="space-y-5">
              <div>
                <label className="label">The Problem Being Solved *</label>
                <textarea
                  name="problemStatement"
                  value={formData.problemStatement}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe the exact real-world pain point, inefficiency, or gap your project tackles..."
                  className="input resize-none"
                  required
                />
              </div>

              <div>
                <label className="label">Your Proposed Solution *</label>
                <textarea
                  name="proposedSolution"
                  value={formData.proposedSolution}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Explain how your software or system directly resolves the problem..."
                  className="input resize-none"
                  required
                />
              </div>

              <div>
                <label className="label">Detailed Project Description & Features *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Provide an in-depth walkthrough of architecture, feature set, user workflow, and impact..."
                  className="input resize-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Tech Stack & Media */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">3. Technology Stack & Media</h2>
            <div className="space-y-5">
              <div>
                <label className="label">Technologies Used *</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={e => setTechInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddTech(e); }}
                    placeholder="e.g. Next.js, Python, PostgreSQL, Docker"
                    className="input"
                  />
                  <button type="button" onClick={handleAddTech} className="btn-secondary">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {technologies.map(t => (
                    <span key={t} className="badge bg-blue-50 text-blue-700 flex items-center gap-1.5 py-1 px-3 text-sm">
                      {t}
                      <button type="button" onClick={() => handleRemoveTech(t)} className="hover:text-blue-900">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Thumbnail / Screenshots (Max 5MB)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-blue-300 transition-colors">
                  {imagePreview ? (
                    <div className="relative inline-block max-w-xs">
                      <img src={imagePreview} alt="Preview" className="h-40 object-cover rounded-xl shadow" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(''); }}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 mb-1">Click to upload or drag & drop</p>
                      <p className="text-xs text-slate-400">PNG, JPG, or WEBP up to 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-4 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Links & Creator Info */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">4. Links & Creator Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">Live Website / Demo URL</label>
                <input
                  type="url"
                  name="liveUrl"
                  value={formData.liveUrl}
                  onChange={handleInputChange}
                  placeholder="https://mycoolproject.com"
                  className="input"
                />
              </div>

              <div>
                <label className="label">GitHub Repository URL</label>
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/project"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Creator / Team Lead Name *</label>
                <input
                  type="text"
                  name="creatorName"
                  value={formData.creatorName}
                  onChange={handleInputChange}
                  placeholder="e.g. Priya Sharma"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Organization or College (Optional)</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  placeholder="e.g. Stanford University, MIT, Acme Labs"
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold mb-0.5">Moderation Notice</p>
              Submissions are set to "Pending Review" and must be approved by an administrator before appearing publicly.
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link to="/explore" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-8"
            >
              {submitting ? 'Submitting...' : 'Submit Project for Review'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
