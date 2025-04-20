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
        
        {/* Feature Sections - Visible on all screens */}
        <div className="w-full max-w-6xl mt-16 space-y-12">
          {/* CogniDAO Pillars Section */}
          <div className="border-t border-blue-500/20 pt-8">
            <h2 className="font-cal text-2xl font-bold text-blue-400 mb-6 text-center">
              CogniDAO Pillars
            </h2>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <div className="rounded-lg border border-blue-500/30 bg-blue-900/10 p-4 backdrop-blur-sm transition-all hover:bg-blue-900/20 hover:border-blue-400/50">
                <h3 className="font-cal text-lg text-blue-300 mb-2">AI Co-Governance</h3>
                <p className="text-gray-400 text-sm">
                  AI stewards guide, enforce, and manage, with transparent human oversight.
                </p>
              </div>
              <div className="rounded-lg border border-blue-500/30 bg-blue-900/10 p-4 backdrop-blur-sm transition-all hover:bg-blue-900/20 hover:border-blue-400/50">
                <h3 className="font-cal text-lg text-blue-300 mb-2">Open Core Infrastructure</h3>
                <p className="text-gray-400 text-sm">
                  Shared, modular tools empowering niche communities to launch and thrive.
                </p>
              </div>
              <div className="rounded-lg border border-blue-500/30 bg-blue-900/10 p-4 backdrop-blur-sm transition-all hover:bg-blue-900/20 hover:border-blue-400/50">
                <h3 className="font-cal text-lg text-blue-300 mb-2">Empowerment & Open Knowledge</h3>
                <p className="text-gray-400 text-sm">
                  Building the Intelligence Commons through accessible knowledge graphs.
                </p>
              </div>
            </div>
          </div>

          {/* Operating Principles Section */}
          <div className="border-t border-violet-500/20 pt-8">
            <h2 className="font-cal text-2xl font-bold text-violet-400 mb-6 text-center">
              Operating Principles
            </h2>
            
            {/* Feature Cards - More compact */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
              <div className="rounded-lg border border-violet-500/30 bg-violet-900/10 p-4 backdrop-blur-sm transition-all hover:bg-violet-900/20 hover:border-violet-400/50">
                <h3 className="font-cal text-lg text-violet-300 mb-2">Fair Contribution</h3>
                <p className="text-gray-400 text-sm">
                  AI-assisted valuation and rewards for all contributions.
                </p>
              </div>
              <div className="rounded-lg border border-violet-500/30 bg-violet-900/10 p-4 backdrop-blur-sm transition-all hover:bg-violet-900/20 hover:border-violet-400/50">
                <h3 className="font-cal text-lg text-violet-300 mb-2">Ethical Monetization</h3>
                <p className="text-gray-400 text-sm">
                  Free core access, fair value for advanced features.
                </p>
              </div>
              <div className="rounded-lg border border-violet-500/30 bg-violet-900/10 p-4 backdrop-blur-sm transition-all hover:bg-violet-900/20 hover:border-violet-400/50">
                <h3 className="font-cal text-lg text-violet-300 mb-2">Live Roadmaps</h3>
                <p className="text-gray-400 text-sm">
                  Transparent, community-driven prioritization via graphs.
                </p>
              </div>
              <div className="rounded-lg border border-violet-500/30 bg-violet-900/10 p-4 backdrop-blur-sm transition-all hover:bg-violet-900/20 hover:border-violet-400/50">
                <h3 className="font-cal text-lg text-violet-300 mb-2">Integrity & Depth</h3>
                <p className="text-gray-400 text-sm">
                  Building with care, clarity, and long-term vision.
                </p>
              </div>
            </div>
          </div>
          
          {/* CogniDAO Links */}
          <div className="pt-6 pb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="https://github.com/derekg1729/CogniDAO"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-gray-700 bg-gray-900/30 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
              >
                Cogni Core Source
              </a>
              <a
                href="https://github.com/derekg1729/cogniDAO-site"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-gray-700 bg-gray-900/30 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
              >
                Cogni Site source
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
