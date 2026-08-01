import React from "react";
import { motion } from "motion/react";
import { Zap, ShieldCheck, Component, ArrowUpRight, BarChart3, Clock, Globe } from "lucide-react";
import { FeatureLabels, FeatureItem } from "../types/types_l";

interface FeatureGridProps {
  labels: FeatureLabels;
}

const iconMap: Record<string, any> = {
  f1: Zap,
  f2: ShieldCheck,
  f3: Component,
};

export function FeatureGrid({ labels }: FeatureGridProps) {
  return (
    <div className="py-8 font-sans">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 font-mono text-[11px] font-bold rounded-full border border-blue-100 mb-4"
        >
          <Globe className="w-3.5 h-3.5 animate-spin" />
          <span>LINGOSAFE LOCALIZATION ENGINE</span>
        </motion.div>
        
        <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight leading-snug">
          {labels.heading}
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
          {labels.subheading}
        </p>
      </div>

      {/* Bento Layout Grid - styled beautiful crisp Sleek Interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-1">
        {labels.cards.map((card: FeatureItem, index: number) => {
          const IconComponent = iconMap[card.id] || Component;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="bg-white hover:bg-slate-50/55 border border-slate-200 p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-slate-300"
            >
              {/* Abs Subtle Blue Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500" />

              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-600 group-hover:scale-105 transition-all duration-150">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-bold font-mono bg-slate-100 px-2.5 py-1 rounded-lg text-slate-500 border border-transparent">
                    {card.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 font-sans group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                  <span>{card.title}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 hover:text-blue-700 transition-all transform translate-x-[-4px] group-hover:translate-x-0" />
                </h3>
                
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 text-left">
                  {card.description}
                </p>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono border-t border-slate-100 pt-4">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{card.readTime}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}