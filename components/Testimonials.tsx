'use client';

import { motion } from 'framer-motion';
import useDisableMotion from '@/lib/useDisableMotion';

interface Testimonial {
  id: string;
  name: string;
  company: string;
  content: string;
  rating: number;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
}

export default function Testimonials({ testimonials = [] }: TestimonialsProps) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const disableMotion = useDisableMotion();

  return (
    <section className="min-h-screen py-24 px-4 bg-[#0a0a0f]" id="testimonials">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={!disableMotion ? { opacity: 0, y: -20 } : undefined}
          whileInView={!disableMotion ? { opacity: 1, y: 0 } : undefined}
          viewport={!disableMotion ? { once: true, margin: '-80px' } : undefined}
          transition={!disableMotion ? { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } : undefined}
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full tracking-widest">
            TESTIMONIALS
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">آراء العملاء</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">ما يقوله عملائي عن عملي ومستوى احترافيتي</p>
        </motion.div>

        <motion.div
          variants={!disableMotion ? containerVariants : undefined}
          initial={!disableMotion ? 'hidden' : undefined}
          whileInView={!disableMotion ? 'visible' : undefined}
          viewport={!disableMotion ? { once: true, margin: '-80px' } : undefined}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {testimonials.map(testimonial => (
            <motion.div
              key={testimonial.id}
              variants={!disableMotion ? cardVariants : undefined}
              className="p-6 rounded-2xl border border-white/8 hover:border-purple-500/30 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="text-lg">⭐</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">"{testimonial.content}"</p>

              {/* Author */}
              <div className="border-t border-white/8 pt-4">
                <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                <p className="text-gray-500 text-xs">{testimonial.company}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
