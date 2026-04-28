'use client';

import { motion } from 'framer-motion';
import { Project } from '@/types';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
}

const categoryLabels: Record<string, string> = {
  'video-editing': 'تحرير فيديو',
  'motion-design': 'موشن ديزاين',
  promotional: 'ترويجي',
  commercial: 'تجاري',
};

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.div
      className="group relative h-full rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/40 transition-all duration-500"
      style={{ background: 'linear-gradient(135deg, #13131f 0%, #0f0f1a 100%)' }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
    >
      {/* Thumbnail Area */}
      <div className="relative h-52 overflow-hidden">
        {/* Gradient placeholder */}
        <div
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, rgba(147,51,234,0.5) 0%, rgba(236,72,153,0.4) 50%, rgba(6,182,212,0.3) 100%)`,
          }}
        />

        {/* Category icon / visual */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity duration-300">
          <span className="text-7xl select-none">
            {project.category === 'motion-design' ? '🎬' :
             project.category === 'video-editing' ? '✂️' :
             project.category === 'promotional' ? '📣' : '🏢'}
          </span>
        </div>

        {/* Featured Badge */}
        {project.featured && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-3 py-1 bg-yellow-400/90 text-black text-xs font-black rounded-full">
              ⭐ مميز
            </span>
          </div>
        )}

        {/* Hover Overlay - single clean one */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <motion.button
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-white text-sm shadow-xl shadow-purple-500/30"
            initial={{ scale: 0.85, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            {project.video_url ? '▶ شاهد المشروع' : '📸 التفاصيل'}
          </motion.button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category pill */}
        <span className="inline-block text-xs font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full mb-3 border border-purple-500/20">
          {categoryLabels[project.category] ?? project.category}
        </span>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.duration && (
            <span className="text-xs text-gray-600 bg-white/5 px-2.5 py-1 rounded-lg">
              ⏱ {project.duration}
            </span>
          )}
          <span className="text-xs text-gray-600 bg-white/5 px-2.5 py-1 rounded-lg">
            📅 {project.year}
          </span>
        </div>

        {/* Technologies */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.technologies.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="text-xs text-cyan-400 bg-cyan-500/8 px-2.5 py-1 rounded-lg border border-cyan-500/20"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className="text-xs text-gray-600 px-2 py-1">
              +{project.technologies.length - 3}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-3">
          <Link href={`/project/${project.id}`} className="flex-1">
            <motion.button
              className="w-full py-2.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 text-white font-semibold rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              📸 التفاصيل
            </motion.button>
          </Link>
          {project.video_url && (
            <motion.a
              href={project.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 text-white font-semibold rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ▶ مشاهدة
            </motion.a>
          )}
        </div>

        {/* View Details Link */}
        <Link href={`/project/${project.id}`}>
          <motion.div
            className="flex items-center justify-end gap-1.5 text-sm font-semibold text-purple-400 hover:text-pink-400 transition-colors"
            whileHover={{ x: -4 }}
          >
            <span>عرض التفاصيل</span>
            <span className="text-base">←</span>
          </motion.div>
        </Link>
      </div>

      {/* Bottom gradient accent */}
      <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}
