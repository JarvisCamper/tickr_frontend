"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import Footer from './components/footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Project interface
interface Project {
  id: number;
  name: string;
  description: string;
  type: string;
  creator: string;
  members: number;
  team: string;
}

// Context type
interface ProjectsContextType {
  projects: Project[];
  addProject: (project: Project) => void;
  deleteProject: (id: number) => void;
  updateProject: (id: number, updatedProject: Partial<Project>) => void;
}

// Create context
const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// Custom hook to use projects context
export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}

// 
function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);

  const addProject = (project: Project) => {
    setProjects((prev) => [...prev, project]);
  };

  const deleteProject = (id: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProject = (id: number, updatedProject: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedProject } : p))
    );
  };

  return (
    <ProjectsContext.Provider value={{ projects, addProject, deleteProject, updateProject }}>
      {children}
    </ProjectsContext.Provider>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`} 
        suppressHydrationWarning
      >
        <ProjectsProvider>
          {/* Fixed Navbar at top */}
          <Navbar />
          
          {/* Main content with padding to prevent hiding behind fixed navbar & footer */}
          <main className="pt-20 pb-20 min-h-screen">
            {children}
          </main>
          
          {/* Fixed Footer at bottom */}
          <Footer />
        </ProjectsProvider>
      </body>
    </html>
  );
}