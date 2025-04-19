import { InlineSnippet } from "@/components/form/domain-configuration";
import Image from "next/image";
import Link from "next/link";
import Chat from "../components/Chat";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
 
      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-start p-4 sm:p-8">
        {/* Logo Section */}
        <div className="w-full flex justify-center my-6">
          <div className="relative w-36 h-36 md:w-48 md:h-48">
            <Image
              fill
              src="/CogniBrainTransparent.png"
              alt="Cogni Brain"
              priority
              className="object-contain"
            />
          </div>
        </div>
        
        {/* Chat Component - Centered and full width */}
        <div className="mx-auto w-full max-w-5xl flex justify-center">
          <Chat />
        </div>
        
        {/* Feature Sections - Hidden on mobile, visible on larger screens */}
        <div className="hidden md:block w-full max-w-6xl mt-16 space-y-12">
          {/* AI Development Enhancements Section */}
          <div className="border-t border-blue-500/20 pt-8">
            <h2 className="font-cal text-2xl font-bold text-blue-400 mb-6 text-center">
              AI Development Enhancements
            </h2>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-blue-500/30 bg-blue-900/10 p-4 backdrop-blur-sm transition-all hover:bg-blue-900/20 hover:border-blue-400/50">
                <h3 className="font-cal text-lg text-blue-300 mb-2">CursorRules</h3>
                <p className="text-gray-400 text-sm">
                  Structured project metadata that guides AI-assisted development
                </p>
              </div>
              <div className="rounded-lg border border-blue-500/30 bg-blue-900/10 p-4 backdrop-blur-sm transition-all hover:bg-blue-900/20 hover:border-blue-400/50">
                <h3 className="font-cal text-lg text-blue-300 mb-2">Test-Driven Development</h3>
                <p className="text-gray-400 text-sm">
                  Comprehensive test infrastructure with clear TDD workflow
                </p>
              </div>
              <div className="rounded-lg border border-blue-500/30 bg-blue-900/10 p-4 backdrop-blur-sm transition-all hover:bg-blue-900/20 hover:border-blue-400/50">
                <h3 className="font-cal text-lg text-blue-300 mb-2">Pre-commit Guardrails</h3>
                <p className="text-gray-400 text-sm">
                  Automated checks for environment variables and code quality
                </p>
              </div>
            </div>
          </div>

          {/* Systematic Development Workflow Section */}
          <div className="border-t border-violet-500/20 pt-8">
            <h2 className="font-cal text-2xl font-bold text-violet-400 mb-6 text-center">
              Systematic Development Workflow
            </h2>
            
            {/* Feature Cards - More compact */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-violet-500/30 bg-violet-900/10 p-4 backdrop-blur-sm transition-all hover:bg-violet-900/20 hover:border-violet-400/50">
                <h3 className="font-cal text-lg text-violet-300 mb-2">Workflow Automation</h3>
                <p className="text-gray-400 text-sm">
                  Self-sustaining development process
                </p>
              </div>
              <div className="rounded-lg border border-violet-500/30 bg-violet-900/10 p-4 backdrop-blur-sm transition-all hover:bg-violet-900/20 hover:border-violet-400/50">
                <h3 className="font-cal text-lg text-violet-300 mb-2">Quality Gates</h3>
                <p className="text-gray-400 text-sm">
                  Built-in quality checks at each stage
                </p>
              </div>
              <div className="rounded-lg border border-violet-500/30 bg-violet-900/10 p-4 backdrop-blur-sm transition-all hover:bg-violet-900/20 hover:border-violet-400/50">
                <h3 className="font-cal text-lg text-violet-300 mb-2">Error Recovery</h3>
                <p className="text-gray-400 text-sm">
                  Robust error handling mechanisms
                </p>
              </div>
              <div className="rounded-lg border border-violet-500/30 bg-violet-900/10 p-4 backdrop-blur-sm transition-all hover:bg-violet-900/20 hover:border-violet-400/50">
                <h3 className="font-cal text-lg text-violet-300 mb-2">Documentation</h3>
                <p className="text-gray-400 text-sm">
                  Seamless integration with docs
                </p>
              </div>
            </div>
          </div>
          
          {/* Documentation Links - More subtle */}
          <div className="pt-6 pb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="https://github.com/derekg1729/agent-platform/blob/main/docs/systematic-dev/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-gray-700 bg-gray-900/30 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
              >
                Framework Overview
              </a>
              <a
                href="https://github.com/derekg1729/agent-platform/blob/main/docs/systematic-dev/workflow.md"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-gray-700 bg-gray-900/30 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
              >
                Workflow Docs
              </a>
              <a
                href="https://github.com/derekg1729/agent-platform/blob/main/docs/systematic-dev/project-description.md"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-gray-700 bg-gray-900/30 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
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
