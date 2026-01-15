import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Music2,
  Heart,
  Sparkles,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  MapPin,
  Phone,
  ArrowUpRight,
} from "lucide-react";
import NoireLogo from "./NoireLogo";

/**
 * NOIRE Footer - Premium, animated, jaw-dropping footer
 * Features:
 * - Animated gradient background with particles
 * - Hover effects on every element
 * - Newsletter subscription with premium styling
 * - Social media links with glow effects
 * - Multi-column layout with smooth animations
 * - Floating music visualizer bars
 * - Premium glassmorphism
 */

const Footer = () => {
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.2 });

  const footerLinks = {
    Product: [
      { label: "Mood Discovery", href: "#moods" },
      { label: "Playlists", href: "#playlists" },
      { label: "Artists", href: "#artists" },
      { label: "Premium", href: "#premium" },
    ],
    Company: [
      { label: "About Us", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Press Kit", href: "#press" },
      { label: "Blog", href: "#blog" },
    ],
    Resources: [
      { label: "Help Center", href: "#help" },
      { label: "API Docs", href: "#api" },
      { label: "Community", href: "#community" },
      { label: "Guidelines", href: "#guidelines" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
      { label: "Cookie Policy", href: "#cookies" },
      { label: "Licenses", href: "#licenses" },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-400" },
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-blue-400" },
    { icon: Youtube, href: "#", label: "YouTube", color: "hover:text-red-400" },
    { icon: Mail, href: "#", label: "Email", color: "hover:text-primary" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <footer ref={footerRef} className="relative bg-background border-t border-border/20 overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-50" />

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
            }}
            animate={{
              y: [null, Math.random() * -100 - 20 + "%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Main Footer Content */}
      <motion.div
        className="relative max-w-7xl mx-auto px-6 py-16 lg:py-20"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Top Section - Newsletter & Branding */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 pb-16 border-b border-border/20"
        >
          {/* Left - Branding & Description */}
          <div className="space-y-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="inline-block"
            >
              <NoireLogo size={40} showText={true} />
            </motion.div>

            <p className="text-muted-foreground text-lg font-body max-w-md leading-relaxed">
              Your emotions, our soundtrack. Experience music that understands how you feel.
              From melancholic nights to euphoric Afrobeats.
            </p>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              {[
                { value: "100K+", label: "Listeners" },
                { value: "50K+", label: "Playlists" },
                { value: "1M+", label: "Songs" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className="group"
                >
                  <div className="text-2xl font-display font-bold text-primary group-hover:text-primary/80 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right - Premium Newsletter */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Stay in the Mood
              </h3>
              <p className="text-muted-foreground font-body">
                Get curated playlists, new releases, and exclusive content delivered weekly.
              </p>
            </div>

            {/* Newsletter Form */}
            <motion.div
              className="relative group"
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500 rounded-2xl" />
              <div className="relative flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-6 py-4 bg-muted/50 backdrop-blur-sm border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 font-body"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-body font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                  Subscribe
                  <ArrowUpRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.8 + index * 0.1, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className={`group relative p-3 bg-muted/30 backdrop-blur-sm border border-border/30 rounded-xl ${social.color} transition-all duration-300 hover:border-current`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                  <div className="absolute -inset-0.5 bg-current opacity-0 group-hover:opacity-10 blur-md rounded-xl transition-opacity duration-300" />
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Middle Section - Links Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + categoryIndex * 0.1, duration: 0.5 }}
              className="space-y-4"
            >
              <h4 className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + categoryIndex * 0.1 + linkIndex * 0.05 }}
                  >
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors duration-300 font-body"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.label}
                      </span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Section - Copyright & Music Visualizer */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-border/20"
        >
          {/* Left - Copyright */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
            <span>© 2026 NOIRE</span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" /> for music lovers
            </span>
          </div>

          {/* Right - Animated Music Visualizer */}
          <div className="flex items-center gap-1.5">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-primary/50 to-primary rounded-full"
                animate={{
                  height: [
                    Math.random() * 10 + 8,
                    Math.random() * 20 + 15,
                    Math.random() * 10 + 8,
                  ],
                }}
                transition={{
                  duration: Math.random() * 0.5 + 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
            ))}
            <Music2 className="w-4 h-4 text-primary ml-2" />
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </footer>
  );
};

export default Footer;
