'use client';

import { motion } from 'framer-motion';
import useDisableMotion from '@/lib/useDisableMotion';

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
}

interface SkillsProps {
  skills?: Skill[];
}

// Tool Icons Component
function ToolIcon({ skillName }: { skillName: string }) {
  let icon = null;
  
  if (skillName.includes('After Effects')) {
    icon = (
      <svg className="w-4 h-4" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="6" fill="#001E3C"/>
        <text x="16" y="22" fontSize="18" fontWeight="bold" fill="#B0AAFF" textAnchor="middle">Ae</text>
      </svg>
    );
  } else if (skillName.includes('Premier') || skillName.includes('Premiere')) {
    icon = (
      <svg className="w-4 h-4" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="6" fill="#001E3C"/>
        <text x="16" y="22" fontSize="18" fontWeight="bold" fill="#B0AAFF" textAnchor="middle">Pr</text>
      </svg>
    );
  } else if (skillName.includes('Blender')) {
    icon = (
      <svg className="w-4 h-4" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="#F37726"/>
        <circle cx="16" cy="16" r="10" fill="#001E3C"/>
        <circle cx="16" cy="16" r="6" fill="#F37726"/>
      </svg>
    );
  } else if (skillName.includes('AI') || skillName.includes('تقنيات الذكاء')) {
    icon = (
      <svg className="w-4 h-4" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2 L22 10 L30 10 L23 16 L26 24 L16 19 L6 24 L9 16 L2 10 L10 10 Z" fill="url(#sparkleGradient)"/>
        <defs>
          <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA"/>
            <stop offset="100%" stopColor="#A78BFA"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }
  
  return icon ? <span className="inline-flex">{icon}</span> : null;
}

export default function Skills({ skills = [] }: SkillsProps) {
  if (!skills || skills.length === 0) {
    return null;
  }

  const categories = [
    { value: 'motion-design', label: 'موشن جرافيك' },
    { value: 'video-editing', label: 'مونتاج فيديو' },
    { value: 'design', label: 'تصميم' },
    { value: '3d-modeling', label: 'نمذجة ثلاثية الأبعاد' },
  ];

  const skillsByCategory = categories.reduce((acc, cat) => {
    acc[cat.value] = skills.filter(s => s.category === cat.value);
    return acc;
  }, {} as Record<string, Skill[]>);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const disableMotion = useDisableMotion();

  return (
    <section className="min-h-screen py-24 px-4 bg-[#0a0a0f] md:bg-[#0d0d14]" id="skills">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={!disableMotion ? { opacity: 0, y: -18 } : undefined}
          whileInView={!disableMotion ? { opacity: 1, y: 0 } : undefined}
          viewport={!disableMotion ? { once: true, amount: 0.18, margin: '-120px' } : undefined}
          transition={!disableMotion ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } : undefined}
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/20 rounded-full tracking-widest">
            المهارات
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-sky-300 to-blue-600 bg-clip-text text-transparent">مهاراتي</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">تجربة عميقة في مختلف جوانب الإنتاج البصري والتصميم</p>
        </motion.div>

        <motion.div
          variants={!disableMotion ? containerVariants : undefined}
          initial={!disableMotion ? 'hidden' : undefined}
          whileInView={!disableMotion ? 'visible' : undefined}
          viewport={!disableMotion ? { once: true, amount: 0.18, margin: '-120px' } : undefined}
          className="space-y-12"
        >
          {categories.map(category => {
            const categorySkills = skillsByCategory[category.value];
            if (!categorySkills || categorySkills.length === 0) return null;

            return (
              <motion.div key={category.value} variants={itemVariants}>
                <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-sky-500 to-blue-600 rounded-full" />
                  {category.label}
                </h3>

                <div className="space-y-4">
                  {categorySkills.map(skill => (
                    <motion.div key={skill.id} variants={!disableMotion ? itemVariants : undefined} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ToolIcon skillName={skill.name} />
                          <span className="text-white font-semibold text-sm">{skill.name}</span>
                        </div>
                        <span className="text-sky-300 text-sm font-bold">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full"
                          initial={!disableMotion ? { width: 0 } : undefined}
                          whileInView={!disableMotion ? { width: `${skill.level}%` } : undefined}
                          viewport={!disableMotion ? { once: true, amount: 0.15 } : undefined}
                          transition={!disableMotion ? { duration: 0.75, delay: 0.1, ease: 'easeOut' } : undefined}
                          style={!disableMotion ? undefined : { width: `${skill.level}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
