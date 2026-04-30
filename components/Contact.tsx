'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useDisableMotion from '@/lib/useDisableMotion';
import { ContactInfo, SocialLink } from '@/types';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface ContactProps {
  contacts?: ContactInfo[];
  socialLinks?: SocialLink[];
}

const getSocialIcon = (name: string) => {
  const icons: Record<string, React.JSX.Element> = {
    Facebook: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
      </svg>
    ),
    Instagram: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
    LinkedIn: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    YouTube: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  };
  return icons[name] || null;
};

export default function Contact({ contacts = [], socialLinks = [] }: ContactProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const disableMotion = useDisableMotion();

  const defaultContacts: ContactInfo[] = [
    {
      id: 'email',
      icon: '📧',
      title: 'البريد الإلكتروني',
      content: 'contact@example.com',
      href: 'mailto:contact@example.com',
    },
    {
      id: 'phone',
      icon: '📱',
      title: 'الهاتف',
      content: '+962 79 123 4567',
      href: 'tel:+962791234567',
    },
    {
      id: 'location',
      icon: '📍',
      title: 'الموقع',
      content: 'الأردن - عمّان',
      href: '#',
    },
    {
      id: 'hours',
      icon: '⏰',
      title: 'ساعات العمل',
      content: '9:00 - 18:00 (الأحد - الخميس)',
      href: '#',
    },
  ];

  const defaultSocialLinks: SocialLink[] = [
    { id: 'facebook', name: 'Facebook', url: '#' , sort_order: 0},
    { id: 'instagram', name: 'Instagram', url: '#', sort_order: 1},
    { id: 'linkedin', name: 'LinkedIn', url: '#', sort_order: 2},
    { id: 'youtube', name: 'YouTube', url: '#', sort_order: 3},
  ];

  const contactsToShow = contacts.length > 0 ? contacts : defaultContacts;
  const socialsToShow = socialLinks.length > 0 ? socialLinks : defaultSocialLinks;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://formspree.io/f/xqewrlbl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
  };

  const inputClass =
    'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 hover:border-white/20';

  return (
    <section
      className="min-h-screen py-24 px-4 bg-[#0a0a0f] md:bg-gradient-to-b md:from-[#0d0d14] md:to-[#0a0a0f]"
      id="contact"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={!disableMotion ? { opacity: 0, y: -18 } : undefined}
          whileInView={!disableMotion ? { opacity: 1, y: 0 } : undefined}
          viewport={!disableMotion ? { once: true, amount: 0.18, margin: '-120px' } : undefined}
          transition={!disableMotion ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } : undefined}
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-full tracking-widest">
            CONTACT
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              تحدّث معي
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            هل لديك مشروع في البال؟ أساعدك في تحويل فكرتك إلى واقع
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Contact Info — 2 cols */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            variants={containerVariants}
            initial={!disableMotion ? 'hidden' : undefined}
            whileInView={!disableMotion ? 'visible' : undefined}
            viewport={!disableMotion ? { once: true, amount: 0.25, margin: '-130px' } : undefined}
          >
            {contactsToShow.map((item) => (
              <motion.div
                key={item.id || item.title}
                variants={itemVariants}
                className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300"
              >
                <div className="text-2xl w-10 text-center flex-shrink-0">{item.icon}</div>
                <div className="text-right">
                  <p className="text-white font-semibold text-sm mb-0.5">{item.title}</p>
                  {item.href && item.href !== '#' ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-gray-500 hover:text-purple-400 transition-colors text-sm"
                      dir={item.id === 'phone' ? 'ltr' : undefined}
                    >
                      {item.content}
                    </a>
                  ) : (
                    <p className="text-gray-500 text-sm" dir={item.id === 'phone' ? 'ltr' : undefined}>{item.content}</p>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Social */}
            <motion.div variants={itemVariants} className="pt-4">
              <p className="text-white font-semibold text-sm mb-4">تابعني على</p>
              <div className="flex gap-3">
                {socialsToShow.map((social) => (
                  <motion.a
                    key={social.id}
                    href={social.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="w-10 h-10 rounded-full bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 hover:bg-purple-600/30 hover:border-purple-400 transition-all text-xs font-bold"
                    whileHover={!disableMotion ? { scale: 1.12, y: -2 } : undefined}
                    whileTap={!disableMotion ? { scale: 0.93 } : undefined}
                  >
                    {getSocialIcon(social.name) || (
                      social.icon ? (
                        social.icon.startsWith('/') || social.icon.startsWith('http') ? (
                          <img src={social.icon} alt={social.name} className="w-5 h-5 object-contain" />
                        ) : (
                          <span className="text-lg">{social.icon}</span>
                        )
                      ) : (
                        social.name[0]
                      )
                    )}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Form — 3 cols */}
          <motion.form
            onSubmit={handleSubmit}
            className="lg:col-span-3 space-y-5 p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
            variants={containerVariants}
            initial={!disableMotion ? 'hidden' : undefined}
            whileInView={!disableMotion ? 'visible' : undefined}
            viewport={!disableMotion ? { once: true, amount: 0.25, margin: '-130px' } : undefined}
          >
            {/* Name + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-gray-300 mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="أدخل اسمك"
                  className={inputClass}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-gray-300 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="your@email.com"
                  className={inputClass}
                />
              </motion.div>
            </div>

            {/* Phone + Subject row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-gray-300 mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="+962 79 ..."
                  className={inputClass}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-gray-300 mb-2">الموضوع</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="ما الموضوع؟"
                  className={inputClass}
                />
              </motion.div>
            </div>

            {/* Message */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-gray-300 mb-2">الرسالة</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                disabled={isSubmitting}
                placeholder="أخبرني عن مشروعك..."
                className={`${inputClass} resize-none`}
              />
            </motion.div>

            {/* Status */}
            <AnimatePresence>
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-medium text-right"
                >
                  ✅ تم إرسال رسالتك بنجاح! سأرد عليك قريباً.
                </motion.div>
              )}
              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium text-right"
                >
                  ❌ حدث خطأ. حاول مرة أخرى.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white text-base hover:shadow-2xl hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!disableMotion ? { scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2 } : undefined}
              whileTap={!disableMotion ? { scale: 0.98 } : undefined}
              variants={itemVariants}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span animate={!disableMotion ? { rotate: 360 } : undefined} transition={!disableMotion ? { duration: 1, repeat: Infinity, ease: 'linear' } : undefined}>
                    ⏳
                  </motion.span>
                  جاري الإرسال...
                </span>
              ) : (
                '📨 إرسال الرسالة'
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
