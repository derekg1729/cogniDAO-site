import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CogniDAO - Knowledge Collective",
  description: "A collaborative platform for knowledge sharing and community-driven insights with advanced AI capabilities.",
  openGraph: {
    title: "CogniDAO - Knowledge Collective",
    description: "Join the knowledge collective for community-driven insights and collaborative knowledge sharing.",
    url: "https://wackywavelength.fyi",
    siteName: "CogniDAO",
  },
  twitter: {
    card: "summary_large_image",
    title: "CogniDAO - Knowledge Collective",
    description: "Join the knowledge collective for community-driven insights and collaborative knowledge sharing.",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 