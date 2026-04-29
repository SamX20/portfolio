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
      className="min-h-screen py-24 px-4"
      id="contact"
      style={{ background: 'linear-gradient(to bottom, #0d0d14, #0a0a0f)' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={!disableMotion ? { opacity: 0, y: -20 } : undefined}
          whileInView={!disableMotion ? { opacity: 1, y: 0 } : undefined}
          viewport={!disableMotion ? { once: true } : undefined}
          transition={!disableMotion ? { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } : undefined}
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-full tracking-widest">
            CONTACT
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
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
            viewport={!disableMotion ? { once: true } : undefined}
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
                    >
                      {item.content}
                    </a>
                  ) : (
                    <p className="text-gray-500 text-sm">{item.content}</p>
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
                    {social.name[0]}
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
            viewport={!disableMotion ? { once: true } : undefined}
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
