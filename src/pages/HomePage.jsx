import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Sprout, ShoppingBag, Utensils, Heart, GraduationCap, Leaf, Car, Cpu, TrendingUp, Building2, Star, Clock, Zap, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getProjects } from '../services/firestore';
import { DEMO_CATEGORIES } from '../data/sampleData';
import ProjectCard from '../components/projects/ProjectCard';
import { PageLoader, SkeletonCard } from '../components/ui/LoadingStates';

const categoryIcons = { Sprout, ShoppingBag, Utensils, Heart, GraduationCap, Leaf, Car, Cpu, TrendingUp, Building2 };

const categoryColorMap = {
  agriculture: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100', hover: 'hover:border-green-300' },
  retail: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100', hover: 'hover:border-blue-300' },
  food: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-100', hover: 'hover:border-orange-300' },
  healthcare: { bg: 'bg-red-50', icon: 'text-red-600', border: 'border-red-100', hover: 'hover:border-red-300' },
  education: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100', hover: 'hover:border-purple-300' },
  environment: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100', hover: 'hover:border-emerald-300' },
  transportation: { bg: 'bg-yellow-50', icon: 'text-yellow-600', border: 'border-yellow-100', hover: 'hover:border-yellow-300' },
  technology: { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-100', hover: 'hover:border-indigo-300' },
  finance: { bg: 'bg-teal-50', icon: 'text-teal-600', border: 'border-teal-100', hover: 'hover:border-teal-300' },
  smartcities: { bg: 'bg-slate-50', icon: 'text-slate-600', border: 'border-slate-200', hover: 'hover:border-slate-400' },
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [trendingProjects, setTrendingProjects] = useState([]);
  const [categories, setCategories] = useState(DEMO_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [featRes, recentRes, trendingRes] = await Promise.all([
          getProjects({ sortBy: 'likes', pageSize: 6 }),
          getProjects({ sortBy: 'createdAt', pageSize: 4 }),
          getProjects({ sortBy: 'views', pageSize: 4 }),
        ]);
        setFeaturedProjects(featRes.projects);
        setRecentProjects(recentRes.projects);
        setTrendingProjects(trendingRes.projects);
        // Calculate project counts per category
        const counts = {};
        featRes.projects.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
        setCategories(prev => prev.map(c => ({ ...c, projectCount: counts[c.id] || c.projectCount || 0 })));
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/find-solutions?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>ProjectVerse — Discover Problems. Explore Solutions. Build the Future.</title>
        <meta name="description" content="ProjectVerse is the global platform connecting problem seekers with innovators who've already built solutions. Explore thousands of real-world projects across agriculture, healthcare, education, technology, and more." />
        <meta property="og:title" content="ProjectVerse — Global Problem-to-Solution Discovery" />
        <meta property="og:description" content="Explore innovative projects, discover solutions to real-world challenges, and connect with the people building them." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://projectverse.dev/" />
      </Helmet>

      {/* ── Hero Section ── */}
      <section className="bg-gradient-hero py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f620 0%, transparent 50%), radial-gradient(circle at 80% 50%, #7c3aed20 0%, transparent 50%)'}} />
        <div className="container-page relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-blue-700">
            <Zap className="w-3.5 h-3.5" />
            12+ Real-World Solutions & Growing
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            Every Problem Has a Solution.
            <br />
            <span className="text-gradient">Discover Yours.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Explore innovative projects, discover solutions to real-world challenges, and connect with the people building them.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search problems, projects, technologies or solutions..."
                className="w-full pl-14 pr-36 py-4 bg-white rounded-2xl border border-gray-200 shadow-lg text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary py-2 text-sm"
              >
                Find Solutions
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/explore" className="btn-primary">
              Explore Projects <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/submit" className="btn-secondary">
              Submit Your Project
            </Link>
          </div>

          {/* Quick example queries */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-sm text-slate-500">
            <span>Try:</span>
            {['food waste', 'crop monitoring', 'student learning', 'hospital queue'].map(q => (
              <button
                key={q}
                onClick={() => navigate(`/find-solutions?q=${encodeURIComponent(q)}`)}
                className="text-blue-600 hover:underline font-medium"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="bg-white border-y border-gray-100">
        <div className="container-page py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { value: '12+', label: 'Projects Listed' },
              { value: '10', label: 'Problem Categories' },
              { value: '8+', label: 'Technologies Covered' },
              { value: '100%', label: 'Open to Explore' },
            ].map(stat => (
              <div key={stat.label} className="text-center py-4 px-6">
                <div className="text-2xl font-extrabold text-blue-600">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Categories ── */}
      <section className="py-16 container-page">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="section-heading mb-2">Browse by Category</h2>
            <p className="text-slate-500">Find solutions organized by the problems they solve</p>
          </div>
          <Link to="/categories" className="btn-ghost text-sm hidden sm:flex">
            All categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map(cat => {
            const colors = categoryColorMap[cat.id] || categoryColorMap.technology;
            const IconComponent = categoryIcons[cat.icon];
            return (
              <Link
                key={cat.id}
                to={`/categories/${cat.id}`}
                className={`group flex flex-col items-center text-center p-5 rounded-2xl border ${colors.border} ${colors.bg} ${colors.hover} bg-white hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5`}
              >
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  {IconComponent && <IconComponent className={`w-6 h-6 ${colors.icon}`} />}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm leading-tight mb-1">{cat.name}</h3>
                <p className="text-xs text-slate-500">{cat.projectCount} project{cat.projectCount !== 1 ? 's' : ''}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Featured Projects ── */}
      <section className="py-16 bg-white">
        <div className="container-page">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <h2 className="section-heading">Featured Projects</h2>
              </div>
              <p className="text-slate-500">Top-rated innovations from our community</p>
            </div>
            <Link to="/explore?sort=likes" className="btn-ghost text-sm hidden sm:flex">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Recently Added & Trending ── */}
      <section className="py-16 container-page">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Recently Added */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900">Recently Added</h2>
              <Link to="/explore?sort=createdAt" className="ml-auto text-sm text-blue-600 hover:underline font-medium">
                See all
              </Link>
            </div>
            <div className="space-y-4">
              {recentProjects.map(project => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 flex-shrink-0 overflow-hidden">
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold text-blue-200">
                        {project.name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm truncate">{project.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{project.shortDescription}</p>
                    <span className="text-xs text-blue-600 font-medium mt-1 inline-block">{project.categoryName}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              <h2 className="text-2xl font-bold text-slate-900">Trending Solutions</h2>
              <Link to="/explore?sort=views" className="ml-auto text-sm text-blue-600 hover:underline font-medium">
                See all
              </Link>
            </div>
            <div className="space-y-4">
              {trendingProjects.map((project, idx) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center font-bold text-violet-600 text-sm flex-shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors text-sm truncate">{project.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{project.shortDescription}</p>
                  </div>
                  <div className="text-xs text-slate-400 flex-shrink-0 text-right">
                    <div>{project.views} views</div>
                    <div>{project.likes} likes</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-violet-700 text-white">
        <div className="container-page text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How ProjectVerse Works</h2>
          <p className="text-blue-100 mb-14 text-lg max-w-xl mx-auto">From discovering a problem to finding—or building—the solution</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Discover a Problem',
                description: 'Search for real-world challenges you are facing or want to solve. Browse by category or describe your problem in plain language.',
                icon: Search,
              },
              {
                step: '02',
                title: 'Explore Solutions',
                description: 'Find projects that address your problem. See technology stacks, demos, source code, and the story behind each solution.',
                icon: Star,
              },
              {
                step: '03',
                title: 'Connect & Contribute',
                description: 'Contact creators for collaboration, fork their ideas, or submit your own solution to help others facing the same challenge.',
                icon: ArrowRight,
              },
            ].map(({ step, title, description, icon: Icon }) => (
              <div key={step} className="relative p-8 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 hover:bg-white/15 transition-all">
                <div className="text-5xl font-black text-white/20 absolute top-6 right-6">{step}</div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link to="/find-solutions" className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-md">
              Find Solutions Now
            </Link>
            <Link to="/submit" className="border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Submit Your Project
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
