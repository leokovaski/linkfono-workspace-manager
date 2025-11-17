export * from './database';

// Plan configuration
export interface PlanConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  stripePriceId: string;
  features: string[];
  maxPatients: number;
  maxMembers: number;
  popular?: boolean;
}

// Wizard step data
export interface WorkspaceFormData {
  name: string;
  cpf_cnpj?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface WorkspaceSettingsFormData {
  appointment_duration: number;
  reminder_hours_before: number;
}

export interface CreateWorkspaceData extends WorkspaceFormData {
  plan_type: string;
  settings: WorkspaceSettingsFormData;
}

// Stripe types
export interface StripeSubscription {
  id: string;
  status: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

export interface StripePaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WorkspaceWithSettings {
  workspace: import('./database').Workspace;
  settings: import('./database').WorkspaceSettings;
  member?: import('./database').WorkspaceMember;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  exp?: number;
  iat?: number;
}
