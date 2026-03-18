'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Layers, Zap, ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-8">
          <Zap className="w-4 h-4" />
          <span>Organize your work, amplify your focus</span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 text-balance">
          Your thoughts,{' '}
          <span className="text-primary">organized</span>
          <br />
          and actionable
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
          TaskFlow is a minimalist task tracker that helps you manage projects, organize notes, and track progress with intuitive drag-and-drop workflows.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button asChild size="lg" className="w-full sm:w-auto text-base px-8">
            <Link href="/register">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-accent" />
            <span>Unlimited projects</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-accent" />
            <span>Drag & drop tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-accent" />
            <span>Custom labels</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-accent" />
            <span>Quick notes</span>
          </div>
        </div>
      </div>

      {/* Preview mockup */}
      <div className="relative z-10 mt-16 w-full max-w-5xl mx-auto px-4">
        <div className="relative rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Window controls */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/50">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-4 text-xs text-muted-foreground">TaskFlow Dashboard</span>
          </div>
          
          {/* Mock content */}
          <div className="flex h-80">
            {/* Sidebar mock */}
            <div className="w-56 border-r border-border bg-sidebar p-4 hidden sm:block">
              <div className="flex items-center gap-2 mb-6">
                <Layers className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sidebar-foreground">TaskFlow</span>
              </div>
              <div className="space-y-2">
                <div className="px-3 py-2 rounded-md bg-sidebar-accent text-sm text-sidebar-accent-foreground">Marketing Campaign</div>
                <div className="px-3 py-2 rounded-md text-sm text-sidebar-foreground/70">Product Launch</div>
                <div className="px-3 py-2 rounded-md text-sm text-sidebar-foreground/70">Q4 Planning</div>
              </div>
            </div>
            
            {/* Main content mock */}
            <div className="flex-1 p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['To-Do', 'In Progress', 'Review', 'Done'].map((label, i) => (
                  <div key={label} className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
                    <div className="space-y-2">
                      {[...Array(Math.max(1, 3 - i))].map((_, j) => (
                        <div key={j} className="p-3 rounded-md bg-secondary/50 border border-border">
                          <div className="h-2 w-full bg-muted rounded animate-pulse" />
                          <div className="h-2 w-2/3 bg-muted rounded mt-2 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
