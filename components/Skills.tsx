'use client';

import { motion } from 'framer-motion';
import useDisableMotion from '@/lib/useDisableMotion';
import { Locale, Skill } from '@/types';

interface SkillsProps {
  skills?: Skill[];
  locale: Locale;
}

function getProgramIcon(program: string) {
  if (/after effects/i.test(program)) return '/Software-icons/adobe-after-effects-icon.svg';
  if (/premiere|premier/i.test(program)) return '/Software-icons/Adobe_Premiere_Pro_CC_icon.svg';
  if (/blender/i.test(program)) return '/Software-icons/blender-icon.svg';
  if (/illustrator/i.test(program)) return '/Software-icons/adobe-illustrator-icon.svg';
  if (/photoshop/i.test(program)) return '/Software-icons/adobe-photoshop-icon.svg';
  if (/davinci|resolve/i.test(program)) return '/Software-icons/DaVinci_Resolve_Studio.png';
  if (/ai tools|generative/i.test(program)) return '/Software-icons/Ai%20Tools.avif';
  return null;
}

function getProgramInitial(program: string) {
  if (/after effects/i.test(program)) return 'Ae';
  if (/premiere|premier/i.test(program)) return 'Pr';
  if (/blender/i.test(program)) return 'B';
  if (/illustrator/i.test(program)) return 'Ai';
  if (/photoshop/i.test(program)) return 'Ps';
  if (/ai tools|generative/i.test(program)) return 'AI';
  return program.slice(0, 2).toUpperCase();
}

export default function Skills({ skills = [], locale }: SkillsProps) {
  const disableMotion = useDisableMotion();
  const isAr = locale === 'ar';

  if (!skills.length) return null;

  const sortedSkills = [...skills].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || b.level - a.level);
  const programs = Array.from(
    sortedSkills.reduce<Map<string, Skill[]>>((acc, skill) => {
      const program = skill.program || skill.name;
      acc.set(program, [...(acc.get(program) || []), skill]);
      return acc;
    }, new Map()).entries(),
  );
  const programNames = programs.map(([program]) => program);

  return (
    <section className="bg-[#080808] px-4 py-24 sm:px-6 lg:px-8" id="skills" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
          initial={!disableMotion ? { opacity: 0, y: 24 } : undefined}
          whileInView={!disableMotion ? { opacity: 1, y: 0 } : undefined}
          viewport={!disableMotion ? { once: true, amount: 0.18, margin: '-120px' } : undefined}
          transition={!disableMotion ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } : undefined}
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#8ed8ff]">{isAr ? 'المهارات والأدوات' : 'Tools and Skills'}</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-5xl">
              {isAr ? 'برامج ومهارات أشتغل عليها.' : 'Programs and craft skills I build with.'}
            </h2>
          </div>
          <div className="flex max-w-2xl flex-wrap gap-2">
            {programNames.slice(0, 8).map((program) => (
              <span key={program} className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/56">
                {program}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-2">
          {programs.map(([program, programSkills], index) => (
            <motion.article
              key={program}
              className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 shadow-2xl shadow-black/10"
              initial={!disableMotion ? { opacity: 0, y: 22 } : undefined}
              whileInView={!disableMotion ? { opacity: 1, y: 0 } : undefined}
              viewport={!disableMotion ? { once: true, amount: 0.16, margin: '-100px' } : undefined}
              transition={!disableMotion ? { duration: 0.5, delay: index * 0.05 } : undefined}
            >
              <div className="mb-5 flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-2">
                  {getProgramIcon(program) ? (
                    <img src={getProgramIcon(program) || ''} alt={`${program} icon`} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-lg font-black text-[#8ed8ff]">{getProgramInitial(program)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-black text-white">{program}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/36">
                    {programSkills.length} {isAr ? 'مهارة' : 'skills'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {programSkills.map((skill) => (
                  <div key={skill.id}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{skill.program_skill || skill.name}</p>
                      </div>
                      <span className="text-sm font-black text-[#8ed8ff]">{skill.level}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#8ed8ff] to-[#2f7dff]"
                        initial={!disableMotion ? { width: 0 } : undefined}
                        whileInView={!disableMotion ? { width: `${skill.level}%` } : undefined}
                        viewport={!disableMotion ? { once: true, amount: 0.2 } : undefined}
                        transition={!disableMotion ? { duration: 0.7, ease: 'easeOut' } : undefined}
                        style={!disableMotion ? undefined : { width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
