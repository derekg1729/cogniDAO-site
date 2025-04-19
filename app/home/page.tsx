import { InlineSnippet } from "@/components/form/domain-configuration";
import Image from "next/image";
import Link from "next/link";
import Chat from "../components/Chat";

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
            priority
            className="w-64 mx-auto"
          />
          <h1 className="font-cal text-4xl font-bold text-white sm:text-5xl">
            <span className="block text-2xl text-indigo-300">Knowledge Collective</span>
          </h1>
          
          {/* Chat Component */}
          <Chat />
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
    </div>
  );
}
