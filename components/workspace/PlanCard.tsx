'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, Zap } from 'lucide-react';
import type { PlanConfig } from '@/types';

interface PlanCardProps {
  plan: PlanConfig;
  selected?: boolean;
  onSelect?: () => void;
}

export function PlanCard({ plan, selected = false, onSelect }: PlanCardProps) {
  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-6 sm:p-8 rounded-2xl border-2 cursor-pointer transition-all h-full flex flex-col
        ${selected
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-2xl shadow-blue-500/20'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-xl hover:shadow-gray-200/50'
        }
        ${plan.popular ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <motion.div
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            MAIS POPULAR
          </div>
        </motion.div>
      )}

      {/* Selected Indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 z-10"
        >
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-2 shadow-lg shadow-green-500/50">
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
        </motion.div>
      )}

      {/* Plan Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-sm text-gray-600">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="mb-8">
        <div className="flex items-baseline">
          <span className="text-5xl font-extrabold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
            R$ {plan.price}
          </span>
          <span className="text-gray-600 ml-2 font-medium">/mês</span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-4 mb-8 flex-1">
        {plan.features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3"
          >
            <div className="mt-0.5 flex-shrink-0">
              <div className="bg-green-100 rounded-full p-1">
                <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
              </div>
            </div>
            <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
          </motion.li>
        ))}
      </ul>

      {/* Select Button */}
      <button
        type="button"
        className={`
          w-full py-3 px-6 rounded-xl font-semibold transition-all
          ${selected
            ? 'bg-green-600 text-white shadow-lg shadow-blue-500/30'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
      >
        {selected ? (
          <span className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            Plano Selecionado
          </span>
        ) : (
          'Selecionar Plano'
        )}
      </button>
    </motion.div>
  );
}
