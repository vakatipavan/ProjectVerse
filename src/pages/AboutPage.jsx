import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Globe, Users, Target, Rocket, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About ProjectVerse — Global Problem-to-Solution Discovery</title>
        <meta name="description" content="Learn about ProjectVerse, our mission to bridge problem seekers with innovators who've already built real-world solutions." />
      </Helmet>

      <div className="container-page py-16 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4 text-sm font-semibold text-blue-700">
            Our Mission
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Connecting Real Problems with Existing Solutions
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Every day, thousands of creators build remarkable solutions to urgent challenges. Yet millions reinvent the wheel because those solutions remain undiscovered.
          </p>
        </div>

        <div className="space-y-12">
          <div className="card p-8 md:p-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Why ProjectVerse Exists</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Traditional developer directories and portfolio sites treat projects simply as code showcases or resume bullet points. They categorize by tech stack ("React Apps", "Python Scripts") instead of the real-world impact they deliver.
            </p>
            <p className="text-slate-600 leading-relaxed">
              <strong>ProjectVerse flips this paradigm.</strong> We organize discoveries by the <em>problem being solved</em>. Whether an NGO is seeking food surplus redistribution software, a farmer needs soil monitoring, or a clinic requires appointment queueing, ProjectVerse connects them directly with working applications and the engineers behind them.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Problem First</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                We prioritize user problems, civic challenges, and operational friction over superficial tech trends.
              </p>
            </div>

            <div className="card p-6">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Collaboration</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Connect directly with project creators to co-develop, fork, or implement their solutions in your organization.
              </p>
            </div>

            <div className="card p-6">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Open Innovation</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Encouraging developers from universities, startups, and community labs to bring their innovations into the light.
              </p>
            </div>
          </div>

          <div className="text-center p-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl text-white">
            <h2 className="text-2xl font-bold mb-3">Join the Global Solution Network</h2>
            <p className="text-blue-100 max-w-xl mx-auto mb-6 text-sm">
              Whether you are facing an unsolved operational challenge or have built software that makes a difference, your journey begins here.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/find-solutions" className="bg-white text-blue-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                Find Solutions
              </Link>
              <Link to="/submit" className="border border-white/30 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">
                Submit Your Project
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
