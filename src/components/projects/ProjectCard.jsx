import { Link } from 'react-router-dom';
import { ExternalLink, Heart, Bookmark, Eye, Users, Code2 } from 'lucide-react';

const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const statusColors = {
  'Active': 'bg-green-100 text-green-700',
  'Completed': 'bg-blue-100 text-blue-700',
  'Under Development': 'bg-amber-100 text-amber-700',
};

const categoryColors = {
  'food': 'bg-orange-100 text-orange-700',
  'retail': 'bg-blue-100 text-blue-700',
  'agriculture': 'bg-green-100 text-green-700',
  'healthcare': 'bg-red-100 text-red-700',
  'education': 'bg-purple-100 text-purple-700',
  'environment': 'bg-emerald-100 text-emerald-700',
  'transportation': 'bg-yellow-100 text-yellow-700',
  'technology': 'bg-indigo-100 text-indigo-700',
  'finance': 'bg-teal-100 text-teal-700',
  'smartcities': 'bg-slate-100 text-slate-700',
};

export default function ProjectCard({ project, relevanceNote }) {
  if (!project) return null;
  const statusClass = statusColors[project.status] || 'bg-gray-100 text-gray-600';
  const catClass = categoryColors[project.category] || 'bg-gray-100 text-gray-600';

  return (
    <article className="card flex flex-col h-full group">
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-50 to-violet-50 flex-shrink-0">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={`${project.name} thumbnail`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl font-bold text-blue-200 select-none">
              {project.name?.[0] || 'P'}
            </div>
          </div>
        )}
        {project.isDemo && (
          <span className="absolute top-3 left-3 text-xs font-medium bg-white/80 backdrop-blur-sm text-slate-500 px-2 py-1 rounded-full border border-slate-200">
            Demo Project
          </span>
        )}
        <span className={`absolute top-3 right-3 badge ${statusClass}`}>
          {project.status}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className={`badge ${catClass} text-xs`}>{project.categoryName}</span>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{project.views || 0}</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{project.likes || 0}</span>
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-base mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-1">
          {project.name}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-3 flex-1">
          {project.shortDescription}
        </p>

        {/* Relevance note (for Find Solutions page) */}
        {relevanceNote && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3 text-xs text-blue-700">
            <span className="font-semibold">Why relevant:</span> {relevanceNote}
          </div>
        )}

        {/* Technologies */}
        {project.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.technologies.slice(0, 4).map(tech => (
              <span key={tech} className="text-xs bg-gray-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="text-xs text-slate-400">+{project.technologies.length - 4}</span>
            )}
          </div>
        )}

        {/* Creator */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-violet-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {project.creatorName?.[0] || 'C'}
          </div>
          <div className="text-xs text-slate-500 truncate">
            <span className="font-medium text-slate-700">{project.creatorName}</span>
            {project.organization && <span> · {project.organization}</span>}
          </div>
          {project.openForCollaboration && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap">
              <Users className="w-3 h-3" /> Open
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link
            to={`/projects/${project.id}`}
            className="btn-primary flex-1 justify-center text-sm py-2"
          >
            View Project
          </Link>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-3 py-2"
              aria-label="Open live project"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-3 py-2"
              aria-label="Open GitHub repository"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
