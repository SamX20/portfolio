'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Project, CATEGORIES } from '@/types';

const catLabel = (cat: string) =>
  CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single()
      .then(({ data }) => {
        setProject(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="text-gray-600 text-sm">جاري التحميل...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0a0a0f' }}>
        <div className="text-gray-500 text-lg">المشروع غير موجود</div>
        <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
          ← العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: '#0a0a0f' }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Link href="/#projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-400 text-sm mb-8 transition-colors">
            <span>→</span> العودة للمشاريع
          </Link>

          {/* Header */}
          <div className="mb-8">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
              {catLabel(project.category)}
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">{project.title}</h1>
            <p className="text-gray-400 text-lg leading-relaxed">{project.description}</p>
          </div>

          {/* Thumbnail placeholder */}
          <div
            className="w-full h-64 md:h-80 rounded-2xl mb-8 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(147,51,234,0.4), rgba(236,72,153,0.3), rgba(6,182,212,0.2))' }}
          >
            <span className="text-6xl opacity-40">
              {project.category === 'motion-design' ? '🎬' :
               project.category === 'video-editing' ? '✂️' :
               project.category === 'promotional' ? '📣' : '🏢'}
            </span>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'السنة', value: String(project.year) },
              { label: 'المدة', value: project.duration ?? '—' },
              { label: 'التصنيف', value: catLabel(project.category) },
              { label: 'مميز', value: project.featured ? 'نعم ⭐' : 'لا' },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-center">
                <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                <div className="text-sm font-semibold text-white">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Technologies */}
          {project.technologies?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-white font-bold mb-3">التقنيات المستخدمة</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech} className="px-3 py-1.5 text-sm text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Video link */}
          {project.video_url && (
            <a
              href={project.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              ▶ شاهد المشروع
            </a>
          )}
        </motion.div>
      </div>
    </div>
  );
}
