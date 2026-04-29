'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import useDisableMotion from '@/lib/useDisableMotion';

interface HeroProps {
  profile?: {
    name: string;
    title: string;
    description: string;
    avatar: string;
    resume: string;
  };
  sections?: {
    hero: {
      title: string;
      subtitle: string;
      description: string;
      cta_text: string;
      cta_link: string;
    };
  };
}

export default function Hero({ profile, sections }: HeroProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const disableMotion = useDisableMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 80]);

  useEffect(() => {
    if (disableMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [disableMotion]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.18, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
  };

  const heroMotionStyle = disableMotion ? undefined : { opacity, y };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Default values
  const heroTitle = sections?.hero?.title || 'مرحباً، أنا محمد علي';
  const heroSubtitle = sections?.hero?.subtitle || 'مصمم ومحرر فيديو احترافي';
  const heroDescription = sections?.hero?.description || 'أحول أفكارك إلى محتوى بصري مذهل يجذب الجمهور ويحقق أهدافك التسويقية.';
  const ctaText = sections?.hero?.cta_text || 'شاهد أعمالي';

  return (
    <div
      ref={ref}
      className="relative w-full min-h-screen overflow-hidden flex items-center justify-center pt-16"
      style={{ backgroundColor: '#0a0a0f' }}
    >
      {/* Mouse-following radial gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(700px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(168,85,247,0.10) 0%, transparent 60%)`,
        }}
      />

      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern" />

      {/* Floating blobs */}
      <motion.div
        className="absolute top-16 right-8 md:right-24 w-80 h-80 rounded-full blur-3xl"
        style={{ background: 'rgba(147, 51, 234, 0.18)' }}
        animate={!disableMotion ? { y: [0, 40, 0], x: [0, 20, 0] } : undefined}
        transition={!disableMotion ? { duration: 9, repeat: Infinity, ease: 'easeInOut' } : undefined}
      />
      <motion.div
        className="absolute bottom-24 left-8 md:left-24 w-72 h-72 rounded-full blur-3xl"
        style={{ background: 'rgba(6, 182, 212, 0.13)' }}
        animate={!disableMotion ? { y: [0, -40, 0], x: [0, -20, 0] } : undefined}
        transition={!disableMotion ? { duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 } : undefined}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(236, 72, 153, 0.07)' }}
        animate={!disableMotion ? { scale: [1, 1.2, 1] } : undefined}
        transition={!disableMotion ? { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } : undefined}
      />

      {/* Main Content */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 py-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={heroMotionStyle}
      >
        {/* Badge */}
        <motion.div className="inline-block mb-8" variants={itemVariants}>
          <span className="px-5 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-sm font-semibold tracking-wide">
            ✨ {heroSubtitle}
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
          variants={itemVariants}
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            {heroTitle}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          variants={itemVariants}
        >
          {heroDescription}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => scrollToSection('projects')}
            className="px-9 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-white hover:shadow-2xl hover:shadow-purple-500/40 transition-all text-base"
            whileHover={!disableMotion ? { scale: 1.05, y: -2 } : undefined}
            whileTap={!disableMotion ? { scale: 0.96 } : undefined}
          >
            {ctaText}
          </motion.button>
          <motion.button
            onClick={() => scrollToSection('contact')}
            className="px-9 py-3.5 border border-cyan-500/50 text-cyan-400 rounded-full font-bold hover:bg-cyan-500/10 hover:border-cyan-400 transition-all text-base"
            whileHover={!disableMotion ? { scale: 1.05, y: -2 } : undefined}
            whileTap={!disableMotion ? { scale: 0.96 } : undefined}
          >
            تواصل معي
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-16"
          variants={itemVariants}
        >
          {[
            { number: '100+', label: 'مشروع منجز' },
            { number: '50+', label: 'عميل راضي' },
            { number: '5+', label: 'سنوات خبرة' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="p-4 rounded-2xl border border-purple-500/20 text-center"
              style={{ background: 'rgba(168,85,247,0.07)' }}
              whileHover={!disableMotion ? { scale: 1.05, borderColor: 'rgba(168,85,247,0.5)' } : undefined}
              transition={!disableMotion ? { duration: 0.2 } : undefined}
            >
              <div className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => scrollToSection('projects')}
          initial={!disableMotion ? { opacity: 0 } : undefined}
          animate={!disableMotion ? { opacity: 1 } : undefined}
          transition={!disableMotion ? { delay: 1.5 } : undefined}
          whileHover={!disableMotion ? { opacity: 0.7 } : undefined}
        >
          <span className="text-gray-600 text-xs tracking-widest">اكتشف المزيد</span>
          <div className="w-6 h-10 rounded-full border border-gray-700 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-purple-400"
              animate={!disableMotion ? { y: [0, 14, 0] } : undefined}
              transition={!disableMotion ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
