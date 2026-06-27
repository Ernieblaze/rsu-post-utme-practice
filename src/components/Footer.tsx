import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Facebook, Twitter, Share2, Mail, MessageCircle, Home, BarChart3, GraduationCap, Layers, Trophy } from 'lucide-react';

type NavView = 'home' | 'progress' | 'revision' | 'bank' | 'admin' | 'leaderboard';

interface FooterProps {
  onNavigate: (view: NavView) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const [siteUrl, setSiteUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSiteUrl(window.location.href);
    }
  }, []);

  const shareText = encodeURIComponent(
    'Pass your RSU Post-UTME with real past questions, instant scoring and explanations.'
  );
  const encodedUrl = encodeURIComponent(siteUrl);

  const socialLinks = [
    {
      icon: <Facebook size={18} />,
      label: 'Share on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      icon: <Twitter size={18} />,
      label: 'Share on X / Twitter',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}`,
    },
    {
      icon: <MessageCircle size={18} />,
      label: 'Share on WhatsApp',
      href: `https://wa.me/?text=${shareText}%20${encodedUrl}`,
    },
    {
      icon: <Mail size={18} />,
      label: 'Send feedback',
      href: 'mailto:?subject=RSU%20Post-UTME%20Practice%20Feedback',
    },
  ];

  return (
    <footer className="mt-16 border-t border-school-green/20 bg-school-navy text-white dark:border-school-green/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-school-green text-white shadow-md">
                <BookOpen size={18} />
              </div>
              <div>
                <div className="font-bold leading-tight">Rivers State University</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-school-gold">Post-UTME Practice</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              A clean, timed practice platform for the Rivers State University Post-UTME screening exam.
              All questions are real past questions from the main university exam.
            </p>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-school-gold">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <button onClick={() => onNavigate('home')} className="flex items-center gap-2 hover:text-white">
                  <Home size={14} /> Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('bank')} className="flex items-center gap-2 hover:text-white">
                  <Layers size={14} /> Practice
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('progress')} className="flex items-center gap-2 hover:text-white">
                  <BarChart3 size={14} /> Progress
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('revision')} className="flex items-center gap-2 hover:text-white">
                  <GraduationCap size={14} /> Revision
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('leaderboard')} className="flex items-center gap-2 hover:text-white">
                  <Trophy size={14} /> Leaderboard
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Connect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-school-gold">Connect</h3>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={siteUrl ? link.href : '#'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-slate-200 transition hover:bg-school-green hover:text-white"
                >
                  {link.icon}
                </a>
              ))}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'RSU Post-UTME Practice', url: siteUrl });
                  } else if (siteUrl) {
                    navigator.clipboard.writeText(siteUrl);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-slate-200 transition hover:bg-school-green hover:text-white"
                aria-label="Copy link"
              >
                <Share2 size={18} />
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Found an error or have a suggestion?{' '}
              <a href="mailto:?subject=RSU%20Post-UTME%20Practice%20Feedback" className="text-school-gold hover:underline">
                Send feedback
              </a>
            </p>
          </motion.div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-400">
          <p className="mb-2">
            Made with ❤️ by <strong className="text-white">Ernie Blzae</strong>. All questions are real past questions from the Rivers State University
            Post-UTME screening exam.
          </p>
          <p>
            This website is not officially affiliated with Rivers State University. &copy; {new Date().getFullYear()} RSU
            Post-UTME Practice.
          </p>
          <p className="mt-2 flex items-center justify-center gap-3">
            <Link to="/privacy" className="text-school-gold hover:underline">Privacy Policy</Link>
            <span className="text-slate-500">•</span>
            <Link to="/terms" className="text-school-gold hover:underline">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
