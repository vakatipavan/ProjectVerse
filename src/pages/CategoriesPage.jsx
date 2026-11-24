import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Sprout, ShoppingBag, Utensils, Heart, GraduationCap, Leaf,
  Car, Cpu, TrendingUp, Building2, ArrowRight, Grid
} from 'lucide-react';
import { DEMO_CATEGORIES } from '../data/sampleData';
import { getProjects } from '../services/firestore';
import ProjectCard from '../components/projects/ProjectCard';
import { PageLoader, EmptyState } from '../components/ui/LoadingStates';

const categoryIcons = {
  Sprout, ShoppingBag, Utensils, Heart, GraduationCap,
  Leaf, Car, Cpu, TrendingUp, Building2
};

export default function CategoriesPage() {
  const { categoryId } = useParams();
  const [categories, setCategories] = useState(DEMO_CATEGORIES);
  const [categoryProjects, setCategoryProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      // Load all project counts
      const res = await getProjects({ pageSize: 100 });
      const counts = {};
      res.projects.forEach(p => {
        counts[p.category] = (counts[p.category] || 0) + 1;
      });
      setCategories(DEMO_CATEGORIES.map(c => ({
        ...c,
        projectCount: counts[c.id] || 0
      })));

      if (categoryId) {
        const found = DEMO_CATEGORIES.find(c => c.id === categoryId);
        if (found) {
          setSelectedCategory(found);
          setLoading(true);
          const pRes = await getProjects({ categoryId, pageSize: 50 });
          setCategoryProjects(pRes.projects);
          setLoading(false);
        }
      } else {
        setSelectedCategory(null);
        setCategoryProjects([]);
      }
    }
    init();
  }, [categoryId]);

  return (
    <>
      <Helmet>
        <title>
          {selectedCategory ? `${selectedCategory.name} Projects — ProjectVerse` : 'Problem Categories — ProjectVerse'}
        </title>
        <meta
          name="description"
          content={selectedCategory ? selectedCategory.description : "Browse verified problem categories and find existing solutions to real-world challenges on ProjectVerse."}
        />
      </Helmet>

      <div className="container-page py-10">
        {selectedCategory ? (
          <div>
            <div className="mb-8">
              <Link to="/categories" className="text-sm font-medium text-blue-600 hover:underline mb-3 inline-block">
                ← All Categories
              </Link>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
                {selectedCategory.name}
              </h1>
              <p className="text-slate-500 max-w-2xl">{selectedCategory.description}</p>
            </div>

            {loading ? (
              <PageLoader />
            ) : categoryProjects.length === 0 ? (
              <EmptyState
                title="No projects in this category yet"
                description="Be the first innovator to submit a solution for this problem domain."
                action={
                  <Link to="/submit" className="btn-primary">
                    Submit a Project
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryProjects.map(p => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="section-heading mb-3">Problem & Domain Categories</h1>
              <p className="text-slate-500 text-lg">
                Explore real-world challenges grouped into major global domains. Discover what innovators have built and where opportunities remain.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(cat => {
                const IconComponent = categoryIcons[cat.icon] || Grid;
                return (
                  <Link
                    key={cat.id}
                    to={`/categories/${cat.id}`}
                    className="card p-6 flex flex-col justify-between group hover:border-blue-200"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed mb-4">
                        {cat.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                      <span className="font-semibold text-slate-700">
                        {cat.projectCount} {cat.projectCount === 1 ? 'Solution' : 'Solutions'}
                      </span>
                      <span className="text-blue-600 font-medium inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Explore <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
