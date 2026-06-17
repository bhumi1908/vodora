export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      candidate_documents: {
        Row: {
          candidate_id: string;
          document_type: string;
          file_name: string;
          file_size_bytes: number | null;
          file_url: string;
          id: string;
          is_primary: boolean;
          mime_type: string | null;
          uploaded_at: string;
        };
        Insert: {
          candidate_id: string;
          document_type: string;
          file_name: string;
          file_size_bytes?: number | null;
          file_url: string;
          id?: string;
          is_primary?: boolean;
          mime_type?: string | null;
          uploaded_at?: string;
        };
        Update: {
          candidate_id?: string;
          document_type?: string;
          file_name?: string;
          file_size_bytes?: number | null;
          file_url?: string;
          id?: string;
          is_primary?: boolean;
          mime_type?: string | null;
          uploaded_at?: string;
        };
        Relationships: [];
      };
      candidate_education: {
        Row: {
          candidate_id: string;
          created_at: string;
          degree_or_class: string;
          description: string | null;
          end_date: string | null;
          id: string;
          institution_name: string;
          sort_order: number;
          start_date: string | null;
          updated_at: string;
        };
        Insert: {
          candidate_id: string;
          created_at?: string;
          degree_or_class: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          institution_name: string;
          sort_order?: number;
          start_date?: string | null;
          updated_at?: string;
        };
        Update: {
          candidate_id?: string;
          created_at?: string;
          degree_or_class?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          institution_name?: string;
          sort_order?: number;
          start_date?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      candidate_skills: {
        Row: {
          candidate_id: string;
          created_at: string;
          id: string;
          proficiency: string | null;
          skill_name: string;
          years_experience: number | null;
        };
        Insert: {
          candidate_id: string;
          created_at?: string;
          id?: string;
          proficiency?: string | null;
          skill_name: string;
          years_experience?: number | null;
        };
        Update: {
          candidate_id?: string;
          created_at?: string;
          id?: string;
          proficiency?: string | null;
          skill_name?: string;
          years_experience?: number | null;
        };
        Relationships: [];
      };
      candidate_work_types: {
        Row: {
          candidate_id: string;
          created_at: string;
          id: string;
          work_type_id: string;
        };
        Insert: {
          candidate_id: string;
          created_at?: string;
          id?: string;
          work_type_id: string;
        };
        Update: {
          candidate_id?: string;
          created_at?: string;
          id?: string;
          work_type_id?: string;
        };
        Relationships: [];
      };
      candidates: {
        Row: {
          availability_start: string | null;
          availability_status: string;
          availability_updated_at: string | null;
          city: string | null;
          contract_expiry_date: string | null;
          country: string | null;
          created_at: string;
          current_company_name: string | null;
          current_position: string | null;
          date_of_birth: string | null;
          experience_level: string | null;
          headline: string | null;
          id: string;
          industry_category_id: string | null;
          is_profile_complete: boolean;
          linkedin_import_data: Json | null;
          linkedin_imported_at: string | null;
          linkedin_profile_url: string | null;
          profession: string | null;
          profile_picture_url: string | null;
          summary: string | null;
          total_years_experience: number | null;
          updated_at: string;
          user_id: string;
          visibility: string;
          vodora_id: string;
        };
        Insert: {
          availability_start?: string | null;
          availability_status?: string;
          availability_updated_at?: string | null;
          city?: string | null;
          contract_expiry_date?: string | null;
          country?: string | null;
          created_at?: string;
          current_company_name?: string | null;
          current_position?: string | null;
          date_of_birth?: string | null;
          experience_level?: string | null;
          headline?: string | null;
          id?: string;
          industry_category_id?: string | null;
          is_profile_complete?: boolean;
          linkedin_import_data?: Json | null;
          linkedin_imported_at?: string | null;
          linkedin_profile_url?: string | null;
          profession?: string | null;
          profile_picture_url?: string | null;
          summary?: string | null;
          total_years_experience?: number | null;
          updated_at?: string;
          user_id: string;
          visibility?: string;
          vodora_id?: string;
        };
        Update: {
          availability_start?: string | null;
          availability_status?: string;
          availability_updated_at?: string | null;
          city?: string | null;
          contract_expiry_date?: string | null;
          country?: string | null;
          created_at?: string;
          current_company_name?: string | null;
          current_position?: string | null;
          date_of_birth?: string | null;
          experience_level?: string | null;
          headline?: string | null;
          id?: string;
          industry_category_id?: string | null;
          is_profile_complete?: boolean;
          linkedin_import_data?: Json | null;
          linkedin_imported_at?: string | null;
          linkedin_profile_url?: string | null;
          profession?: string | null;
          profile_picture_url?: string | null;
          summary?: string | null;
          total_years_experience?: number | null;
          updated_at?: string;
          user_id?: string;
          visibility?: string;
          vodora_id?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          city: string | null;
          country: string | null;
          created_at: string;
          employee_count_range: string | null;
          hires_per_year_range: string | null;
          id: string;
          is_active: boolean;
          is_verified: boolean;
          logo_url: string | null;
          name: string;
          slug: string;
          updated_at: string;
          verification_notes: string | null;
          verification_status: string;
          verification_submitted_at: string | null;
          verified_at: string | null;
          website: string | null;
        };
        Insert: {
          city?: string | null;
          country?: string | null;
          created_at?: string;
          employee_count_range?: string | null;
          hires_per_year_range?: string | null;
          id?: string;
          is_active?: boolean;
          is_verified?: boolean;
          logo_url?: string | null;
          name: string;
          slug: string;
          updated_at?: string;
          verification_notes?: string | null;
          verification_status?: string;
          verification_submitted_at?: string | null;
          verified_at?: string | null;
          website?: string | null;
        };
        Update: {
          city?: string | null;
          country?: string | null;
          created_at?: string;
          employee_count_range?: string | null;
          hires_per_year_range?: string | null;
          id?: string;
          is_active?: boolean;
          is_verified?: boolean;
          logo_url?: string | null;
          name?: string;
          slug?: string;
          updated_at?: string;
          verification_notes?: string | null;
          verification_status?: string;
          verification_submitted_at?: string | null;
          verified_at?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      company_members: {
        Row: {
          company_id: string;
          id: string;
          invited_by: string | null;
          is_active: boolean;
          joined_at: string;
          team_role: string;
          user_id: string;
        };
        Insert: {
          company_id: string;
          id?: string;
          invited_by?: string | null;
          is_active?: boolean;
          joined_at?: string;
          team_role: string;
          user_id: string;
        };
        Update: {
          company_id?: string;
          id?: string;
          invited_by?: string | null;
          is_active?: boolean;
          joined_at?: string;
          team_role?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      employment_history: {
        Row: {
          candidate_id: string;
          company_name: string;
          created_at: string;
          description: string | null;
          end_date: string | null;
          id: string;
          is_current: boolean;
          job_title: string;
          location: string | null;
          sort_order: number;
          start_date: string;
          updated_at: string;
        };
        Insert: {
          candidate_id: string;
          company_name: string;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          is_current?: boolean;
          job_title: string;
          location?: string | null;
          sort_order?: number;
          start_date: string;
          updated_at?: string;
        };
        Update: {
          candidate_id?: string;
          company_name?: string;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          is_current?: boolean;
          job_title?: string;
          location?: string | null;
          sort_order?: number;
          start_date?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      industry_categories: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          sort_order?: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      recruiters: {
        Row: {
          bio: string | null;
          candidate_search_enabled: boolean;
          company_id: string | null;
          created_at: string;
          id: string;
          job_title: string | null;
          recruiter_type: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          bio?: string | null;
          candidate_search_enabled?: boolean;
          company_id?: string | null;
          created_at?: string;
          id?: string;
          job_title?: string | null;
          recruiter_type?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          bio?: string | null;
          candidate_search_enabled?: boolean;
          company_id?: string | null;
          created_at?: string;
          id?: string;
          job_title?: string | null;
          recruiter_type?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          assigned_at: string;
          assigned_by: string | null;
          id: string;
          role_id: string;
          user_id: string;
        };
        Insert: {
          assigned_at?: string;
          assigned_by?: string | null;
          id?: string;
          role_id: string;
          user_id: string;
        };
        Update: {
          assigned_at?: string;
          assigned_by?: string | null;
          id?: string;
          role_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          city: string | null;
          country: string | null;
          created_at: string;
          email: string;
          email_verified_at: string | null;
          first_name: string;
          id: string;
          is_active: boolean;
          last_login_at: string | null;
          last_name: string;
          login_count: number;
          phone: string | null;
          terms_accepted_at: string | null;
          updated_at: string;
        };
        Insert: {
          city?: string | null;
          country?: string | null;
          created_at?: string;
          email: string;
          email_verified_at?: string | null;
          first_name: string;
          id: string;
          is_active?: boolean;
          last_login_at?: string | null;
          last_name: string;
          login_count?: number;
          phone?: string | null;
          terms_accepted_at?: string | null;
          updated_at?: string;
        };
        Update: {
          city?: string | null;
          country?: string | null;
          created_at?: string;
          email?: string;
          email_verified_at?: string | null;
          first_name?: string;
          id?: string;
          is_active?: boolean;
          last_login_at?: string | null;
          last_name?: string;
          login_count?: number;
          phone?: string | null;
          terms_accepted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      work_types: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          sort_order?: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_own_candidate_profile: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      get_recruiter_dashboard_candidates: {
        Args: {
          p_limit?: number;
        };
        Returns: Json;
      };
      get_recruiter_candidate_profile: {
        Args: {
          p_vodora_id: string;
        };
        Returns: Json;
      };
      register_candidate: {
        Args: {
          p_city: string;
          p_country: string;
          p_industry_category_id: string;
          p_profession: string;
          p_terms_accepted?: boolean;
          p_work_type_codes: string[];
        };
        Returns: string;
      };
      register_recruiter: {
        Args: {
          p_city: string;
          p_company_name: string;
          p_country: string;
          p_employee_count_range: string;
          p_hires_per_year_range: string;
          p_job_title: string;
          p_recruiter_type: string;
          p_terms_accepted?: boolean;
          p_website: string;
        };
        Returns: string;
      };
      record_user_login: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
