"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Star, Zap, Shield, TrendingUp, Brain } from "lucide-react";
import Link from "next/link";

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-black overflow-x-hidden">
            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
                {/* Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10"
                >
                    <span className="px-4 py-1.5 rounded-full border border-border-subtle bg-panel text-sm font-medium text-accent backdrop-blur-md mb-6 inline-block">
                        🚀 The #1 AI Productivity OS for Deep Work
                    </span>
                    <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                        Master Your Focus. <br /> Double Your Output.
                    </h1>
                    <p className="text-lg md:text-2xl text-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Stop letting distractions steal your potential. Aura OS uses{" "}
                        <span className="text-foreground font-semibold">AI & Memory</span> to force you into Flow State.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/login"
                            className="group relative px-8 py-4 bg-accent text-black font-bold text-lg rounded-full overflow-hidden transition-transform active:scale-95 hover:scale-105"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Start Focusing Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Link>
                        <p className="text-sm text-foreground/40 mt-2 sm:mt-0">
                            Free forever for early adopters. No credit card required.
                        </p>
                    </div>
                </motion.div>

                {/* Hero Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="mt-20 relative z-10 w-full max-w-5xl group"
                    style={{ perspective: "1000px" }}
                >
                    <div className="relative rounded-xl border border-border-subtle bg-zinc-900/50 backdrop-blur-sm shadow-2xl overflow-hidden aspect-video transform group-hover:rotate-x-2 transition-transform duration-700 ease-out">
                        {/* Mock UI */}
                        <div className="absolute inset-0 flex items-center justify-center text-foreground/10 font-mono text-4xl font-bold uppercase tracking-widest">
                            Aura OS Dashboard
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
                    </div>
                    {/* Reflection */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                </motion.div>
            </section>

            {/* --- SOCIAL PROOF --- */}
            <section className="py-10 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm font-medium text-foreground/40 uppercase tracking-widest mb-8">
                        Trusted by Builders at
                    </p>
                    <div className="flex flex-wrap justify-center gap-12 text-foreground/20 font-bold text-xl grayscale opacity-50">
                        {['ACME Corp', 'Stark Industries', 'Wayne Tech', 'Cyberdyne', 'Massive Dynamic'].map(brand => (
                            <span key={brand} className="hover:text-foreground hover:opacity-100 transition-colors">{brand}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- THE GRAND SLAM OFFER (Value Stack) --- */}
            <section className="py-32 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">The "Unfair Advantage" Stack</h2>
                    <p className="text-xl text-foreground/60">Everything you need to reclaim 4+ hours every day.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <OfferCard
                        icon={<Brain className="w-8 h-8 text-purple-400" />}
                        title="AI Context Memory"
                        desc="The system remembers why you got distracted last time and preemptively warns you. It's like a coach that never sleeps."
                        value="Value: Priceless"
                    />
                    <OfferCard
                        icon={<Zap className="w-8 h-8 text-yellow-400" />}
                        title="Pattern Recognition"
                        desc="We analyze your bio-rhythms to tell you exactly WHEN you should do deep work for 2x output."
                        value="Value: $49/mo"
                    />
                    <OfferCard
                        icon={<Shield className="w-8 h-8 text-green-400" />}
                        title="Distraction Shield"
                        desc="Hardcore blocking features that prevent you from opening Doomscrolling apps."
                        value="Value: $29/mo"
                    />
                </div>
            </section>

            {/* --- GUARANTEE (Risk Reversal) --- */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-accent/5 skew-y-3 transform origin-bottom-right" />
                <div className="max-w-4xl mx-auto text-center relative z-10 border border-border-subtle bg-zinc-900/80 p-12 rounded-3xl backdrop-blur-xl">
                    <h3 className="text-3xl font-bold mb-6">Our "Flow State" Guarantee</h3>
                    <p className="text-lg text-foreground/70 mb-8">
                        If you don't feel significantly more focused within your first **3 sessions**,
                        we will delete your account and you never pay a dime. No questions asked.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-accent font-bold">
                        <Check className="w-5 h-5" /> 100% Risk Free
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className="py-32 text-center">
                <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter">
                    Ready to <span className="text-accent underline decoration-4 underline-offset-4">Focus</span>?
                </h2>
                <Link
                    href="/login"
                    className="inline-flex items-center gap-3 px-12 py-6 bg-white text-black text-2xl font-bold rounded-full hover:bg-zinc-200 transition-colors"
                >
                    Get Access Now <ArrowRight />
                </Link>
            </section>

            <footer className="py-10 text-center text-foreground/20 text-sm border-t border-white/5">
                &copy; {new Date().getFullYear()} Aura OS. All rights reserved.
            </footer>
        </div>
    );
};

const OfferCard = ({ icon, title, desc, value }: { icon: any, title: string, desc: string, value: string }) => (
    <div className="p-8 rounded-2xl bg-panel border border-border-subtle hover:border-accent/40 hover:bg-white/[0.07] transition-all duration-300">
        <div className="mb-6 p-4 bg-background/40 rounded-xl inline-block border border-white/5">
            {icon}
        </div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-foreground/60 mb-6 leading-relaxed">{desc}</p>
        <div className="text-accent font-mono text-sm uppercase tracking-wider opacity-80 border-t border-border-subtle pt-4">
            {value}
        </div>
    </div>
);
