export type WorkspaceStatus =
  | 'trial'
  | 'active'
  | 'inactive'
  | 'payment_pending'
  | 'cancelled'
  | 'suspended';

export type PlanType =
  | 'individual'
  | 'fono_plus'
  | 'pro';

export type WorkspaceRole =
  | 'owner'
  | 'member';

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: Workspace;
        Insert: WorkspaceInsert;
        Update: WorkspaceUpdate;
      };
      workspace_settings: {
        Row: WorkspaceSettings;
        Insert: WorkspaceSettingsInsert;
        Update: WorkspaceSettingsUpdate;
      };
      workspace_members: {
        Row: WorkspaceMember;
        Insert: WorkspaceMemberInsert;
        Update: WorkspaceMemberUpdate;
      };
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
    };
    Views: {
      workspace_members_view: {
        Row: WorkspaceMemberView;
      };
    };
  };
}

export interface Workspace {
  id: string;
  name: string;
  cpf_cnpj: string | null;
  address: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  status: WorkspaceStatus;
  plan_type: PlanType;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string;
  subscription_ends_at: string | null;
  max_patients: number;
  max_members: number;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceInsert {
  id?: string;
  name: string;
  cpf_cnpj?: string | null;
  address?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  status?: WorkspaceStatus;
  plan_type?: PlanType;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  trial_ends_at?: string;
  subscription_ends_at?: string | null;
  max_patients?: number;
  max_members?: number;
}

export interface WorkspaceUpdate {
  name?: string;
  cpf_cnpj?: string | null;
  address?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  status?: WorkspaceStatus;
  plan_type?: PlanType;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  trial_ends_at?: string;
  subscription_ends_at?: string | null;
  max_patients?: number;
  max_members?: number;
  updated_at?: string;
}

export interface WorkspaceSettings {
  workspace_id: string;
  appointment_duration: number;
  reminder_hours_before: number;
  allow_online_booking: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceSettingsInsert {
  workspace_id: string;
  appointment_duration?: number;
  reminder_hours_before?: number;
  allow_online_booking?: boolean;
}

export interface WorkspaceSettingsUpdate {
  appointment_duration?: number;
  reminder_hours_before?: number;
  allow_online_booking?: boolean;
  updated_at?: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  is_active: boolean;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMemberInsert {
  id?: string;
  workspace_id: string;
  user_id: string;
  role?: WorkspaceRole;
  is_active?: boolean;
}

export interface WorkspaceMemberUpdate {
  role?: WorkspaceRole;
  is_active?: boolean;
  updated_at?: string;
}

export interface WorkspaceMemberView {
  id: string;
  workspace_id: string;
  workspace_name: string;
  user_id: string;
  full_name: string;
  email: string;
  whatsapp: string | null;
  role: WorkspaceRole;
  is_active: boolean;
  joined_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string | null;
  stripe_customer_id: string | null;
  trial_used: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id?: string;
  full_name: string;
  email: string;
  whatsapp?: string | null;
  stripe_customer_id?: string | null;
  trial_used?: boolean;
}

export interface ProfileUpdate {
  full_name?: string;
  email?: string;
  whatsapp?: string | null;
  stripe_customer_id?: string | null;
  trial_used?: boolean;
  updated_at?: string;
}
