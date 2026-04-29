'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import useDisableMotion from '@/lib/useDisableMotion';
import { supabase } from '@/lib/supabase';
import { Project, CATEGORIES } from '@/types';
import ProjectCard from './ProjectCard';

const ALL_CATS = [{ value: 'all', label: 'الكل' }, ...CATEGORIES];

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const disableMotion = useDisableMotion();

  useEffect(() => {
    if (!supabase) {
      setError('Supabase غير مكوّن. يرجى إعداد متغيرات البيئة.');
      setLoading(false);
      return;
    }

    supabase.from('projects').select('*').order('sort_order').then(({ data, error: fetchError }) => {
      if (fetchError) {
        setError(fetchError.message || 'حدث خطأ أثناء تحميل المشاريع.');
      }
      if (data) setProjects(data);
      setLoading(false);
    });
  }, []);

  const filtered = activeCategory === 'all' ? projects : projects.filter(p => p.category === activeCategory);

  return (
    <section className="min-h-screen py-24 px-4" id="projects" style={{ backgroundColor: '#0d0d14' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-16" initial={!disableMotion ? { opacity: 0, y: -20 } : undefined} whileInView={!disableMotion ? { opacity: 1, y: 0 } : undefined} viewport={!disableMotion ? { once: true, margin: '-80px' } : undefined} transition={!disableMotion ? { duration: 0.7, ease: [0.22,1,0.36,1] as [number,number,number,number] } : undefined}>
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full tracking-widest">PORTFOLIO</span>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">مشاريعي</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">مجموعة من أفضل أعمالي في مجال تحرير الفيديو والموشن ديزاين</p>
        </motion.div>

        <motion.div className="flex flex-wrap justify-center gap-3 mb-14" initial={!disableMotion ? { opacity: 0 } : undefined} whileInView={!disableMotion ? { opacity: 1 } : undefined} viewport={!disableMotion ? { once: true } : undefined} transition={!disableMotion ? { delay: 0.2 } : undefined}>
          <LayoutGroup>
            {ALL_CATS.map(cat => (
              <motion.button key={cat.value} onClick={() => setActiveCategory(cat.value)} className={`relative px-6 py-2.5 rounded-full font-semibold transition-colors text-sm ${activeCategory === cat.value ? 'text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`} whileHover={!disableMotion ? { scale: 1.04 } : undefined} whileTap={!disableMotion ? { scale: 0.96 } : undefined}>
                {activeCategory === cat.value && <motion.div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600" layoutId="activePill" transition={!disableMotion ? { type: 'spring', stiffness: 400, damping: 35 } : undefined} />}
                <span className="relative z-10">{cat.label}</span>
              </motion.button>
            ))}
          </LayoutGroup>
        </motion.div>

        {loading ? (
          <div className="text-center py-20 text-gray-600">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div key={activeCategory} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" initial={!disableMotion ? { opacity: 0 } : undefined} animate={!disableMotion ? { opacity: 1 } : undefined} exit={!disableMotion ? { opacity: 0 } : undefined} transition={!disableMotion ? { duration: 0.3 } : undefined}>
              {filtered.map((project, index) => (
                <motion.div key={project.id} initial={!disableMotion ? { opacity: 0, y: 24, scale: 0.97 } : undefined} animate={!disableMotion ? { opacity: 1, y: 0, scale: 1 } : undefined} exit={!disableMotion ? { opacity: 0, y: -16, scale: 0.97 } : undefined} transition={!disableMotion ? { duration: 0.5, delay: index * 0.07, ease: [0.22,1,0.36,1] as [number,number,number,number] } : undefined}>
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        <motion.div className="text-center mt-12" initial={!disableMotion ? { opacity: 0 } : undefined} whileInView={!disableMotion ? { opacity: 1 } : undefined} viewport={!disableMotion ? { once: true } : undefined} transition={!disableMotion ? { delay: 0.5 } : undefined}>
          <p className="text-gray-600 text-sm">
            عرض <span className="text-purple-400 font-bold">{filtered.length}</span> من <span className="text-pink-400 font-bold">{projects.length}</span> مشروع
          </p>
        </motion.div>
      </div>
    </section>
  );
}
