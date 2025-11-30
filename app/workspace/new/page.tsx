'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Sparkles, Check } from 'lucide-react';
import { WorkspaceDataStep } from '@/components/workspace/wizard/WorkspaceDataStep';
import { PlanSelectionStep } from '@/components/workspace/wizard/PlanSelectionStep';
import { ConfirmStep } from '@/components/workspace/wizard/ConfirmStep';
import { createClient } from '@/lib/supabase/client';
import type { WorkspaceFormData, PlanType, WorkspaceSettingsFormData } from '@/types';

export default function NewWorkspacePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [workspaceData, setWorkspaceData] = useState<WorkspaceFormData & { settings: WorkspaceSettingsFormData }>({
    name: '',
    settings: {
      appointment_duration: 50,
      reminder_hours_before: 24,
    },
  });
  const [selectedPlan, setSelectedPlan] = useState<PlanType>();
  const [trialAvailable, setTrialAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if user can use trial by calling API
    const checkTrialAvailability = async () => {
      try {
        const response = await fetch('/api/user/trial-status');

        if (!response.ok) {
          console.error('Failed to fetch trial status');
          setTrialAvailable(true); // Default to available on error
          setLoading(false);
          return;
        }

        const data = await response.json();
        setTrialAvailable(!data.trialUsed);
      } catch (error) {
        console.error('Error checking trial availability:', error);
        setTrialAvailable(true); // Default to available on error
      } finally {
        setLoading(false);
      }
    };

    checkTrialAvailability();
  }, []);

  const handleWorkspaceDataNext = (data: WorkspaceFormData & { settings: WorkspaceSettingsFormData }) => {
    setWorkspaceData(data);
    setCurrentStep(2);
  };

  const handlePlanNext = (planType: PlanType) => {
    setSelectedPlan(planType);
    setCurrentStep(3);
  };

  const handleConfirm = async () => {
    setSubmitting(true);

    try {
      // Call API to create Stripe checkout session
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceData,
          planType: selectedPlan,
          trialAvailable,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Erro ao processar pagamento. Por favor, tente novamente.');
      setSubmitting(false);
    }
  };

  const steps = [
    {
      number: 1,
      name: 'Seu Espaço',
      description: 'Configure seu espaço',
      icon: Building2
    },
    {
      number: 2,
      name: 'Plano',
      description: 'Escolha seu plano',
      icon: Sparkles
    },
    {
      number: 3,
      name: 'Confirmar',
      description: 'Revise e finalize',
      icon: Check
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-white to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        {/* <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            LinkFono
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Configure sua clínica em poucos passos
          </p>
        </motion.div> */}

        {/* Modern Progress Stepper */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10 hidden sm:block">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-600"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>

            {steps.map((step, index) => {
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              const Icon = step.icon;

              return (
                <div key={step.number} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                    }}
                    className="relative"
                  >
                    {/* <div
                      className={`
                        w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                        transition-all duration-300 relative z-10
                        ${isCompleted
                          ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
                          : isCurrent
                          ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                      ) : (
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div> */}

                    {/* {isCurrent && (
                      <motion.div
                        layoutId="activeStep"
                        className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full -z-10"
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.5 }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                      />
                    )} */}
                  </motion.div>

                  <div className="mt-3 text-center">
                    <div className={`text-xs sm:text-sm font-semibold ${
                      isCurrent ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          layout
          className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 sm:p-8 lg:p-10 border border-gray-100"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <WorkspaceDataStep
                  initialData={workspaceData}
                  onNext={handleWorkspaceDataNext}
                />
              )}

              {currentStep === 2 && (
                <PlanSelectionStep
                  initialPlan={selectedPlan}
                  trialAvailable={trialAvailable}
                  onNext={handlePlanNext}
                  onBack={() => setCurrentStep(1)}
                />
              )}

              {currentStep === 3 && selectedPlan && (
                <ConfirmStep
                  workspaceData={workspaceData}
                  planType={selectedPlan}
                  trialAvailable={trialAvailable}
                  onBack={() => setCurrentStep(2)}
                  onConfirm={handleConfirm}
                  loading={submitting}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>Seus dados estão seguros e protegidos</p>
        </motion.div>
      </div>
    </div>
  );
}
