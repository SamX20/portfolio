'use client';

import { motion } from 'framer-motion';

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
}

interface SkillsProps {
  skills?: Skill[];
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

  return (
    <section className="min-h-screen py-24 px-4" id="skills" style={{ backgroundColor: '#0d0d14' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full tracking-widest">
            المهارات
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">مهاراتي</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">تجربة عميقة في مختلف جوانب الإنتاج البصري والتصميم</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="space-y-12"
        >
          {categories.map(category => {
            const categorySkills = skillsByCategory[category.value];
            if (!categorySkills || categorySkills.length === 0) return null;

            return (
              <motion.div key={category.value} variants={itemVariants}>
                <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                  {category.label}
                </h3>

                <div className="space-y-4">
                  {categorySkills.map(skill => (
                    <motion.div key={skill.id} variants={itemVariants} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold text-sm">{skill.name}</span>
                        <span className="text-purple-400 text-sm font-bold">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.1 }}
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
