import { InlineSnippet } from "@/components/form/domain-configuration";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  // Using NEXTAUTH_URL for development and constructing production URL from ROOT_DOMAIN
  const loginUrl = process.env.NEXTAUTH_URL 
    ? `${process.env.NEXTAUTH_URL}/login`
    : `https://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login`;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Cogni-themed Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-900 opacity-95 z-0"></div>
      <div className="absolute inset-0 bg-[url('/cogni-spire.png')] bg-cover bg-center opacity-30 z-0"></div>
      
      {/* Hero Section */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center space-y-10 px-4 pb-20 pt-16 text-center sm:pb-32 sm:pt-24">
        <div className="bg-black/40 p-6 rounded-2xl backdrop-blur-sm border border-indigo-500/20 shadow-xl">
          <Image
            width={512}
            height={512}
            src="/CogniBrainTransparent.png"
            alt="CogniDAO"
            className="w-64 mx-auto mb-6"
          />
          <div className="max-w-2xl space-y-4">
            <h1 className="font-cal text-4xl font-bold text-white sm:text-5xl">
              CogniDAO Platform
              <span className="block text-2xl mt-2 text-indigo-300">Knowledge Collective</span>
            </h1>
            <p className="text-lg text-white/80">
              Communcally building tools to empower communities.
              <br />
              Use Cogni to spawn your own AI-powered organization.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row mt-8 justify-center">
            <a
              href={loginUrl}
              className="rounded-lg bg-indigo-600 px-6 py-3 font-cal text-white transition-all hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-1"
            >
              Login
            </a>
            <a
              href="https://github.com/derekg1729/agent-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3 font-cal text-white transition-all hover:bg-white/20 hover:shadow-lg transform hover:-translate-y-1"
            >
              View Source
            </a>
          </div>
        </div>
      </div>

      {/* Original Features Section */}
      <div className="relative z-10 border-t border-indigo-500/20 px-4 py-16 text-center bg-black/40 backdrop-blur-md">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-cal text-3xl font-bold text-white mb-2">
            Original Starter Kit Features
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            The foundation from Vercel&apos;s Platform Starter Kit
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-900/20 p-6 backdrop-blur-sm transition-all hover:bg-indigo-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-white mb-2">Multi-Tenant Auth</h3>
              <p className="text-stone-300">
                GitHub authentication with role-based access control
              </p>
            </div>
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-900/20 p-6 backdrop-blur-sm transition-all hover:bg-indigo-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-white mb-2">Custom Domains</h3>
              <p className="text-stone-300">
                Add and verify custom domains for each site
              </p>
            </div>
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-900/20 p-6 backdrop-blur-sm transition-all hover:bg-indigo-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-white mb-2">Edge Middleware</h3>
              <p className="text-stone-300">
                Fast, global routing with Vercel Edge Functions
              </p>
            </div>
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-900/20 p-6 backdrop-blur-sm transition-all hover:bg-indigo-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-white mb-2">PostgreSQL DB</h3>
              <p className="text-stone-300">
                Secure, scalable database with row-level security
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Features Section */}
      <div className="relative z-10 border-t border-indigo-500/20 px-4 py-16 text-center bg-black/30 backdrop-blur-md">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-cal text-3xl font-bold text-indigo-300 mb-2">
            Enhanced Benefits
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Additional features and improvements in this enhanced edition
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-900/20 p-6 backdrop-blur-sm transition-all hover:bg-indigo-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-indigo-300 mb-2">Comprehensive Tests</h3>
              <p className="text-stone-300">
                TDD approach with unit, integration, and build tests
              </p>
            </div>
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-900/20 p-6 backdrop-blur-sm transition-all hover:bg-indigo-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-indigo-300 mb-2">Google Analytics</h3>
              <p className="text-stone-300">
                Built-in event tracking and performance monitoring
              </p>
            </div>
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-900/20 p-6 backdrop-blur-sm transition-all hover:bg-indigo-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-indigo-300 mb-2">Enhanced UI</h3>
              <p className="text-stone-300">
                Modern, responsive design with improved aesthetics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Development Enhancements Section */}
      <div className="relative z-10 border-t border-indigo-500/20 px-4 py-16 text-center bg-black/40 backdrop-blur-md">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-cal text-3xl font-bold text-blue-300 mb-2">
            AI Development Enhancements
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Features that enhance AI-assisted development workflows
          </p>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-blue-500/30 bg-blue-900/20 p-6 backdrop-blur-sm transition-all hover:bg-blue-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-blue-300 mb-2">CursorRules</h3>
              <p className="text-stone-300">
                Structured project metadata that guides AI-assisted development with best practices
              </p>
            </div>
            <div className="rounded-xl border border-blue-500/30 bg-blue-900/20 p-6 backdrop-blur-sm transition-all hover:bg-blue-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-blue-300 mb-2">Test-Driven Development</h3>
              <p className="text-stone-300">
                Comprehensive test infrastructure with clear TDD workflow documentation
              </p>
            </div>
            <div className="rounded-xl border border-blue-500/30 bg-blue-900/20 p-6 backdrop-blur-sm transition-all hover:bg-blue-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-blue-300 mb-2">Pre-commit Guardrails</h3>
              <p className="text-stone-300">
                Automated checks for environment variables, linting, type safety, tests, and build verification
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Systematic Development Workflow Section */}
      <div className="relative z-10 border-t border-indigo-500/20 px-4 py-16 text-center bg-black/30 backdrop-blur-md">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-cal text-3xl font-bold text-violet-300 mb-2">
            Systematic Development Workflow
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            A structured approach to AI-driven development with minimal human intervention
          </p>
          
          {/* Workflow Visualization */}
          <div className="mb-10 overflow-auto">
            <pre className="text-xs md:text-sm bg-black/50 p-4 rounded-lg border border-violet-500/30 text-violet-100 overflow-auto mx-auto max-w-3xl text-left">
              {`┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Workflow       │     │  Development    │     │  Bug Resolution │
│  Decision       │────►│  Workflow       │     │  Workflow       │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         └─────────────►│  Documentation  │◄─────────────┘
                        │  Workflow       │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Error Recovery │
                        │  Workflow       │
                        └─────────────────┘`}
            </pre>
          </div>
          
          {/* Feature Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-violet-500/30 bg-violet-900/20 p-6 backdrop-blur-sm transition-all hover:bg-violet-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-violet-300 mb-2">Workflow Automation</h3>
              <p className="text-stone-300">
                Self-sustaining development process with clear steps and transitions
              </p>
            </div>
            <div className="rounded-xl border border-violet-500/30 bg-violet-900/20 p-6 backdrop-blur-sm transition-all hover:bg-violet-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-violet-300 mb-2">Quality Gates</h3>
              <p className="text-stone-300">
                Built-in quality checks at each stage of development
              </p>
            </div>
            <div className="rounded-xl border border-violet-500/30 bg-violet-900/20 p-6 backdrop-blur-sm transition-all hover:bg-violet-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-violet-300 mb-2">Error Recovery</h3>
              <p className="text-stone-300">
                Robust error handling and recovery mechanisms
              </p>
            </div>
            <div className="rounded-xl border border-violet-500/30 bg-violet-900/20 p-6 backdrop-blur-sm transition-all hover:bg-violet-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-violet-300 mb-2">Documentation Integration</h3>
              <p className="text-stone-300">
                Seamless integration with project documentation
              </p>
            </div>
          </div>
          
          {/* Documentation Links */}
          <div className="mt-10">
            <h3 className="font-cal text-2xl text-white mb-4">Learn More</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://github.com/derekg1729/agent-platform/blob/main/docs/systematic-dev/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-violet-500/30 bg-violet-900/20 px-6 py-3 font-cal text-violet-300 transition-all hover:bg-violet-900/30 hover:shadow-lg"
              >
                Framework Overview
              </a>
              <a
                href="https://github.com/derekg1729/agent-platform/blob/main/docs/systematic-dev/workflow.md"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-violet-500/30 bg-violet-900/20 px-6 py-3 font-cal text-violet-300 transition-all hover:bg-violet-900/30 hover:shadow-lg"
              >
                Workflow Documentation
              </a>
              <a
                href="https://github.com/derekg1729/agent-platform/blob/main/docs/systematic-dev/project-description.md"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-violet-500/30 bg-violet-900/20 px-6 py-3 font-cal text-violet-300 transition-all hover:bg-violet-900/30 hover:shadow-lg"
              >
                Project Description
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bugfixes Section */}
      <div className="relative z-10 border-t border-indigo-500/20 px-4 py-16 text-center bg-black/50 backdrop-blur-md">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-cal text-3xl font-bold text-blue-300 mb-2">
            Critical Bugfixes
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Issues resolved from the original Vercel Starter Kit
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-blue-500/30 bg-blue-900/20 p-6 backdrop-blur-sm transition-all hover:bg-blue-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-blue-300 mb-2">GitHub Auth Email Requirement</h3>
              <p className="text-stone-300 mb-3">
                Fixed issue #409 where GitHub authentication required email access, causing login failures
              </p>
              <a 
                href="https://github.com/vercel/platforms/issues/409" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-300 hover:text-blue-200 underline"
              >
                View original issue
              </a>
            </div>
            <div className="rounded-xl border border-blue-500/30 bg-blue-900/20 p-6 backdrop-blur-sm transition-all hover:bg-blue-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-blue-300 mb-2">Build Issues</h3>
              <p className="text-stone-300">
                Resolved build failures caused by Novel editor dependencies and configuration
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-indigo-500/20 py-8 text-center bg-black/60 backdrop-blur-md">
        <p className="text-stone-400">
          Edit this page in{" "}
          <InlineSnippet className="ml-2 bg-stone-800 text-stone-300">
            app/home/page.tsx
          </InlineSnippet>
        </p>
      </div>
    </div>
  );
}
