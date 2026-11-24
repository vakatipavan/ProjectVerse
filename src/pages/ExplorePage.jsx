import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Grid, List, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getProjects } from '../services/firestore';
import { DEMO_CATEGORIES } from '../data/sampleData';
import ProjectCard from '../components/projects/ProjectCard';
import { SkeletonCard, EmptyState } from '../components/ui/LoadingStates';

const TECHNOLOGIES = ['React', 'Node.js', 'Python', 'Flutter', 'React Native', 'Vue.js', 'Firebase', 'MongoDB', 'PostgreSQL', 'TensorFlow', 'IoT', 'AWS', 'Docker', 'Blockchain'];
const PROJECT_TYPES = ['Web Application', 'Mobile Application', 'Desktop Application', 'SaaS', 'API / Backend', 'IoT / Hardware', 'Other'];
const PROJECT_STATUSES = ['Active', 'Completed', 'Under Development'];
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest First' },
  { value: 'likes', label: 'Most Liked' },
  { value: 'views', label: 'Most Viewed' },
];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const tech = searchParams.get('tech') || '';
  const status = searchParams.get('status') || '';
  const type = searchParams.get('type') || '';
  const sort = searchParams.get('sort') || 'createdAt';

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const activeFilterCount = [category, tech, status, type].filter(Boolean).length;

  const loadProjects = useCallback(async (reset = true) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const { projects: newProjects, lastDoc: newLastDoc, hasMore: newHasMore } = await getProjects({
        categoryId: category || undefined,
        tech: tech || undefined,
        status: status || undefined,
        type: type || undefined,
        sortBy: sort,
        pageSize: 12,
        lastDoc: reset ? null : lastDoc,
      });

      // Client-side text search
      let filtered = newProjects;
      if (q) {
        const term = q.toLowerCase();
        filtered = filtered.filter(p =>
          p.name?.toLowerCase().includes(term) ||
          p.shortDescription?.toLowerCase().includes(term) ||
          (p.tags || []).some(t => t.toLowerCase().includes(term)) ||
          (p.technologies || []).some(t => t.toLowerCase().includes(term))
        );
      }

      setProjects(reset ? filtered : prev => [...prev, ...filtered]);
      setLastDoc(newLastDoc);
      setHasMore(newHasMore);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [q, category, tech, status, type, sort]);

  useEffect(() => {
    loadProjects(true);
  }, [loadProjects]);

  return (
    <>
      <Helmet>
        <title>Explore Projects — ProjectVerse</title>
        <meta name="description" content="Browse and discover innovative real-world projects across agriculture, healthcare, education, technology and more on ProjectVerse." />
      </Helmet>

      <div className="container-page py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-heading mb-2">Explore Projects</h1>
          <p className="text-slate-500">Discover innovations solving real-world problems across every domain</p>
        </div>

        {/* Search & Controls bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              defaultValue={q}
              onKeyDown={e => { if (e.key === 'Enter') updateParam('q', e.target.value); }}
              onBlur={e => updateParam('q', e.target.value)}
              placeholder="Search projects, technologies, problems..."
              className="input pl-11"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sort}
              onChange={e => updateParam('sort', e.target.value)}
              className="input w-auto pr-8 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary gap-2 relative ${showFilters ? 'border-blue-300 text-blue-600' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-gray-50'}`} aria-label="Grid view">
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-gray-50'}`} aria-label="List view">
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="label">Category</label>
                <select value={category} onChange={e => updateParam('category', e.target.value)} className="input text-sm">
                  <option value="">All Categories</option>
                  {DEMO_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Technology</label>
                <select value={tech} onChange={e => updateParam('tech', e.target.value)} className="input text-sm">
                  <option value="">All Technologies</option>
                  {TECHNOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select value={status} onChange={e => updateParam('status', e.target.value)} className="input text-sm">
                  <option value="">All Statuses</option>
                  {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Project Type</label>
                <select value={type} onChange={e => updateParam('type', e.target.value)} className="input text-sm">
                  <option value="">All Types</option>
                  {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              { key: 'category', value: category, label: DEMO_CATEGORIES.find(c => c.id === category)?.name },
              { key: 'tech', value: tech, label: tech },
              { key: 'status', value: status, label: status },
              { key: 'type', value: type, label: type },
            ].filter(f => f.value).map(f => (
              <span key={f.key} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100">
                {f.label}
                <button onClick={() => updateParam(f.key, '')} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-slate-500 mb-6">
            {projects.length === 0 ? 'No projects found' : `Showing ${projects.length} project${projects.length !== 1 ? 's' : ''}`}
            {q && <span> for "<strong>{q}</strong>"</span>}
          </p>
        )}

        {/* Projects Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No projects found"
            description="Try adjusting your search terms or clearing filters to discover more projects."
            action={
              <div className="flex gap-3 justify-center">
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
                <Link to="/submit" className="btn-secondary">Submit Your Project</Link>
              </div>
            }
          />
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {projects.map(project => <ProjectCard key={project.id} project={project} />)}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center mt-10">
            <button
              onClick={() => loadProjects(false)}
              disabled={loadingMore}
              className="btn-secondary px-8"
            >
              {loadingMore ? 'Loading...' : 'Load More Projects'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
