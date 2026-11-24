import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Lightbulb, Sparkles, ArrowRight, Info } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { searchProjects } from '../services/firestore';
import ProjectCard from '../components/projects/ProjectCard';
import { PageLoader, EmptyState } from '../components/ui/LoadingStates';

const EXAMPLE_PROBLEMS = [
  'How can restaurants reduce food wastage?',
  'How can farmers monitor crop health remotely?',
  'How can small shops manage inventory efficiently?',
  'How can students find personalized learning resources?',
  'How can cities reduce water wastage?',
  'How can hospitals reduce patient wait times?',
  'How can communities trade renewable energy?',
];

function computeRelevanceNote(project, searchTerm) {
  const term = searchTerm.toLowerCase();
  const matches = [];
  if (project.name?.toLowerCase().includes(term)) matches.push(`project name mentions "${searchTerm}"`);
  if (project.problemStatement?.toLowerCase().includes(term)) matches.push('directly addresses this problem');
  if (project.proposedSolution?.toLowerCase().includes(term)) matches.push('solution matches your query');
  if ((project.tags || []).some(t => t.toLowerCase().includes(term))) matches.push(`tagged "${searchTerm}"`);
  if ((project.technologies || []).some(t => t.toLowerCase().includes(term))) matches.push(`uses ${searchTerm} technology`);
  if (project.categoryName?.toLowerCase().includes(term)) matches.push(`falls under ${project.categoryName} category`);
  if (project.shortDescription?.toLowerCase().includes(term)) matches.push('description matches your search');
  return matches.length > 0 ? matches[0] : 'keyword match in project details';
}

export default function FindSolutionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, []);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const found = await searchProjects(searchTerm.trim());
      setResults(found);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = inputValue.trim();
    if (!term) return;
    setQuery(term);
    setSearchParams({ q: term });
    performSearch(term);
  };

  const handleExampleClick = (example) => {
    setInputValue(example);
    setQuery(example);
    setSearchParams({ q: example });
    performSearch(example);
  };

  return (
    <>
      <Helmet>
        <title>Find Solutions — ProjectVerse</title>
        <meta name="description" content="Describe a real-world problem and discover projects that have already built solutions. Search by keywords across thousands of innovations on ProjectVerse." />
      </Helmet>

      <div className="container-page py-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-5 text-sm text-blue-700 font-medium">
            <Lightbulb className="w-3.5 h-3.5" />
            Problem-to-Solution Discovery
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Describe Your Problem.<br />
            <span className="text-gradient">Find the Solution.</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed mb-2">
            Enter a real-world challenge and we'll find projects that have already built solutions. Results are based on keyword matching across project descriptions, problem statements, and categories.
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <Info className="w-3 h-3" />
            Keyword matching — not AI. Results match your terms across all project data.
          </div>
        </div>

        {/* Search form */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(e); } }}
                placeholder="e.g. How can restaurants reduce food wastage?"
                className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl border border-gray-200 shadow-lg text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none"
                rows={2}
              />
            </div>
            <div className="flex justify-center mt-3">
              <button type="submit" className="btn-primary px-8 py-3 text-base">
                <Search className="w-4 h-4" /> Find Solutions
              </button>
            </div>
          </form>
        </div>

        {/* Example queries */}
        {!hasSearched && (
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-sm text-slate-500 mb-4 font-medium">Try these example problems:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {EXAMPLE_PROBLEMS.map(example => (
                <button
                  key={example}
                  onClick={() => handleExampleClick(example)}
                  className="text-sm px-4 py-2 bg-white border border-gray-200 rounded-xl text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" style={{borderWidth: '3px'}} />
            <p className="text-slate-500">Searching for solutions...</p>
          </div>
        )}

        {hasSearched && !loading && (
          <div className="mt-10">
            {results.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No matching solutions found"
                description={`We didn't find projects matching "${query}". Try different keywords, or submit your own solution!`}
                action={
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/explore" className="btn-primary">Browse All Projects</Link>
                    <Link to="/submit" className="btn-secondary">Submit a Solution</Link>
                  </div>
                }
              />
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {results.length} Solution{results.length !== 1 ? 's' : ''} Found
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                      Showing projects matching: "<strong>{query}</strong>"
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Keyword-matched results
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      relevanceNote={computeRelevanceNote(project, query)}
                    />
                  ))}
                </div>
                <div className="text-center mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <h3 className="font-bold text-slate-900 mb-2">Don't see the right solution?</h3>
                  <p className="text-slate-500 text-sm mb-4">You could be the one to build it. Submit your project and help others facing the same challenge.</p>
                  <Link to="/submit" className="btn-primary">
                    Submit Your Solution <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
