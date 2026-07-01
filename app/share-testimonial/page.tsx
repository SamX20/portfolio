'use client';

import { FormEvent, useState } from 'react';

export default function ShareTestimonialPage() {
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<'idle' | 'saving' | 'sent'>('idle');
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('saving');
    setError('');

    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get('name'),
      company: form.get('company'),
      role: form.get('role'),
      email: form.get('email'),
      content: form.get('content'),
      rating,
    };

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data.error || 'Could not send your testimonial.');

      event.currentTarget.reset();
      setRating(5);
      setStatus('sent');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not send your testimonial.');
      setStatus('idle');
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-10 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <section>
          <a href="/" className="inline-flex text-xs font-black uppercase tracking-[0.18em] text-[#8ed8ff]">
            Xsamer
          </a>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">Share your experience working with Sam.</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/56">
            A few honest lines help future clients understand the process, the communication, and the final result.
          </p>
          <div className="mt-8 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] text-center">
            {['Fast', 'Clear', 'Polished'].map((item) => (
              <div key={item} className="border-r border-white/10 px-4 py-4 last:border-r-0">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/58">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/35 sm:p-7">
          {status === 'sent' ? (
            <div className="grid min-h-[440px] place-items-center text-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8ed8ff]">Sent</p>
                <h2 className="mt-3 text-3xl font-black">Thank you.</h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-white/55">
                  Your testimonial is now saved and will appear on Sam's portfolio.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-7 rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white/70 transition hover:border-[#8ed8ff]/50 hover:text-white"
                >
                  Add another
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Name</span>
                  <input name="name" required className="h-12 w-full border border-white/10 bg-black/25 px-4 text-sm outline-none transition focus:border-[#8ed8ff]/70" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Company / Brand</span>
                  <input name="company" required className="h-12 w-full border border-white/10 bg-black/25 px-4 text-sm outline-none transition focus:border-[#8ed8ff]/70" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Role</span>
                  <input name="role" placeholder="Founder, Marketing Manager..." className="h-12 w-full border border-white/10 bg-black/25 px-4 text-sm outline-none transition placeholder:text-white/24 focus:border-[#8ed8ff]/70" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Email</span>
                  <input name="email" type="email" placeholder="Optional" className="h-12 w-full border border-white/10 bg-black/25 px-4 text-sm outline-none transition placeholder:text-white/24 focus:border-[#8ed8ff]/70" />
                </label>
              </div>
              <div>
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Rating</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`grid h-11 w-11 place-items-center rounded-full border text-sm font-black transition ${
                        value <= rating ? 'border-[#8ed8ff] bg-[#8ed8ff] text-[#05070b]' : 'border-white/10 bg-black/25 text-white/45'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-white/42">Your experience</span>
                <textarea
                  name="content"
                  required
                  minLength={12}
                  rows={7}
                  placeholder="What was it like to work together? What improved in the final video?"
                  className="w-full resize-none border border-white/10 bg-black/25 px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-white/24 focus:border-[#8ed8ff]/70"
                />
              </label>
              {error && <p className="rounded-2xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
              <button disabled={status === 'saving'} className="accent-gradient rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#05070b] disabled:opacity-50">
                {status === 'saving' ? 'Sending...' : 'Send testimonial'}
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
