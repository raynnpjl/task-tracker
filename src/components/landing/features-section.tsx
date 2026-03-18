'use client';

import { FolderKanban, StickyNote, Tags, GripVertical, Palette, Shield } from 'lucide-react';

const features = [
  {
    icon: FolderKanban,
    title: 'Project Organization',
    description: 'Create unlimited projects to organize your work. Each project has its own workspace with notes and tasks.',
  },
  {
    icon: StickyNote,
    title: 'Quick Notes',
    description: 'Capture fleeting thoughts with unlabeled quick notes. Perfect for ideas that need a home but not a category.',
  },
  {
    icon: Tags,
    title: 'Custom Labels',
    description: 'Create your own workflow labels. Whether it\'s To-Do, In Progress, or anything else you need.',
  },
  {
    icon: GripVertical,
    title: 'Drag & Drop',
    description: 'Move tasks between labels effortlessly. Track progress visually as items flow through your workflow.',
  },
  {
    icon: Palette,
    title: 'Color Coded',
    description: 'Assign colors to labels for visual clarity. Quickly scan and identify task statuses at a glance.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data stays yours. Each user has their own private workspace with secure authentication.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Everything you need to stay organized
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Simple, powerful tools that adapt to your workflow without getting in the way.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
