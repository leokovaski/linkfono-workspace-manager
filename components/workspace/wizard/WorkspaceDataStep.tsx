'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, FileText, MapPin, ArrowRight, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';
import type { WorkspaceFormData, WorkspaceSettingsFormData } from '@/types';

interface WorkspaceDataStepProps {
  initialData?: WorkspaceFormData & { settings?: WorkspaceSettingsFormData };
  onNext: (data: WorkspaceFormData & { settings: WorkspaceSettingsFormData }) => void;
}

type DocumentType = 'cpf' | 'cnpj';

interface AddressData {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export function WorkspaceDataStep({ initialData, onNext }: WorkspaceDataStepProps) {
  const [subStep, setSubStep] = useState(1);
  const [documentType, setDocumentType] = useState<DocumentType | null>(initialData?.cpf_cnpj ? 'cnpj' : null);
  const [workspaceName, setWorkspaceName] = useState(initialData?.name || '');
  const [cep, setCep] = useState(initialData?.zip_code || '');
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [number, setNumber] = useState(initialData?.number || '');
  const [complement, setComplement] = useState(initialData?.complement || '');
  const [duration, setDuration] = useState(initialData?.settings?.appointment_duration || 50);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');

  const totalSubSteps = 5;

  const fetchAddress = async (zipCode: string) => {
    const cleanCep = zipCode.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setCepError('CEP deve ter 8 dígitos');
      return;
    }

    setLoadingCep(true);
    setCepError('');

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepError('CEP não encontrado');
        setLoadingCep(false);
        return;
      }

      setAddressData(data);
      setLoadingCep(false);
      setSubStep(4);
    } catch (error) {
      setCepError('Erro ao buscar CEP');
      setLoadingCep(false);
    }
  };

  const handleNext = () => {
    if (subStep < totalSubSteps) {
      setSubStep(subStep + 1);
    } else {
      // Final step - submit form
      const formData: WorkspaceFormData & { settings: WorkspaceSettingsFormData } = {
        name: workspaceName,
        cpf_cnpj: documentType === 'cnpj' ? 'placeholder' : undefined,
        zip_code: cep,
        address: addressData?.logradouro || '',
        number,
        complement,
        neighborhood: addressData?.bairro || '',
        city: addressData?.localidade || '',
        state: addressData?.uf || '',
        settings: {
          appointment_duration: duration,
          reminder_hours_before: 24,
        },
      };
      onNext(formData);
    }
  };

  const handleBack = () => {
    if (subStep > 1) {
      setSubStep(subStep - 1);
    }
  };

  const canProceed = () => {
    switch (subStep) {
      case 1:
        return documentType !== null;
      case 2:
        return workspaceName.trim().length > 0;
      case 3:
        return cep.replace(/\D/g, '').length === 8;
      case 4:
        return number.trim().length > 0;
      case 5:
        return duration > 0;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Building2 className="w-7 h-7 text-blue-600" />
          Seu Espaço
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Etapa {subStep} de {totalSubSteps}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(subStep / totalSubSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Sub-steps Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={subStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[300px]"
        >
          {/* Sub-step 1: Document Type Selection */}
          {subStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Como você quer seguir com a criação do seu espaço?
                </h3>
                <p className="text-gray-600 text-sm">
                  Escolha a opção que melhor se encaixa no seu perfil profissional
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CPF Option */}
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDocumentType('cpf')}
                  className={`
                    p-6 rounded-2xl border-2 cursor-pointer transition-all
                    ${documentType === 'cpf'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${documentType === 'cpf' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <FileText className={`w-6 h-6 ${documentType === 'cpf' ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Com CPF</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Ideal para profissionais que emitem recibo e não têm local fixo de atendimento
                      </p>
                    </div>
                    {documentType === 'cpf' && (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                </motion.div>

                {/* CNPJ Option */}
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDocumentType('cnpj')}
                  className={`
                    p-6 rounded-2xl border-2 cursor-pointer transition-all
                    ${documentType === 'cnpj'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${documentType === 'cnpj' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Building2 className={`w-6 h-6 ${documentType === 'cnpj' ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Com CNPJ</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Ideal para profissionais que emitem notas fiscais e possuem consultório/clínica
                      </p>
                    </div>
                    {documentType === 'cnpj' && (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Sub-step 2: Workspace Name */}
          {subStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Como você quer chamar o seu local?
                </h3>
                <p className="text-gray-600 text-sm">
                  Escolha um nome que represente seu espaço de atendimento
                </p>
              </div>

              <div>
                <label htmlFor="workspace-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Espaço
                </label>
                <input
                  id="workspace-name"
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-400 transition-all text-lg"
                  placeholder="Ex: Clínica Saúde & Bem-estar"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Sub-step 3: CEP */}
          {subStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {documentType === 'cpf' ? 'Qual seu CEP?' : 'Qual o CEP do seu local de atendimento?'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {documentType === 'cpf'
                    ? 'Informe seu CEP residencial ou de correspondência'
                    : 'Informe o CEP do seu consultório ou clínica'
                  }
                </p>
              </div>

              <div>
                <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="cep"
                    type="text"
                    value={cep}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const formatted = value.replace(/^(\d{5})(\d)/, '$1-$2');
                      setCep(formatted);
                      setCepError('');
                    }}
                    maxLength={9}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-400 transition-all text-lg"
                    placeholder="00000-000"
                    autoFocus
                  />
                </div>
                {cepError && (
                  <p className="mt-2 text-sm text-red-600">{cepError}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => fetchAddress(cep)}
                disabled={loadingCep || cep.replace(/\D/g, '').length !== 8}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loadingCep ? 'Buscando...' : 'Buscar Endereço'}
              </button>
            </div>
          )}

          {/* Sub-step 4: Address Details */}
          {subStep === 4 && addressData && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Confirme seu endereço
                </h3>
                <p className="text-gray-600 text-sm">
                  Complete as informações do endereço
                </p>
              </div>

              {/* Address Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700">
                  {addressData.logradouro}<br />
                  {addressData.bairro}<br />
                  {addressData.localidade} - {addressData.uf}
                </p>
              </div>

              {/* Number and Complement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
                    Número <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="number"
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-400 transition-all"
                    placeholder="123"
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="complement" className="block text-sm font-medium text-gray-700 mb-2">
                    Complemento
                  </label>
                  <input
                    id="complement"
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-400 transition-all"
                    placeholder="Apto 45, Bloco B"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sub-step 5: Appointment Duration */}
          {subStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Qual o tempo de duração dos seus atendimentos?
                </h3>
                <p className="text-gray-600 text-sm">
                  Informe a duração média em minutos
                </p>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duração (minutos)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min="15"
                    max="240"
                    step="5"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-400 transition-all text-lg"
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Sugestão: 30, 45, 50 ou 60 minutos
                </p>
              </div>

              {/* Quick Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[30, 45, 50, 60].map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setDuration(min)}
                    className={`py-2 px-4 rounded-xl font-medium transition-all ${
                      duration === min
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={handleBack}
          disabled={subStep === 1}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed() || (subStep === 3 && loadingCep)}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
        >
          {subStep === totalSubSteps ? 'Continuar' : 'Próximo'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
