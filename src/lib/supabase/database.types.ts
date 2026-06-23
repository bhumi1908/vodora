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
          default_cover_letter: string | null;
          experience_level: string | null;
          headline: string | null;
          id: string;
          industry_category_id: string | null;
          is_profile_complete: boolean;
          job_title_id: string | null;
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
          default_cover_letter?: string | null;
          experience_level?: string | null;
          headline?: string | null;
          id?: string;
          industry_category_id?: string | null;
          is_profile_complete?: boolean;
          job_title_id?: string | null;
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
          default_cover_letter?: string | null;
          experience_level?: string | null;
          headline?: string | null;
          id?: string;
          industry_category_id?: string | null;
          is_profile_complete?: boolean;
          job_title_id?: string | null;
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
        Relationships: [
          {
            foreignKeyName: "candidates_job_title_id_fkey";
            columns: ["job_title_id"];
            isOneToOne: false;
            referencedRelation: "job_titles";
            referencedColumns: ["id"];
          },
        ];
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
      company_invitations: {
        Row: {
          accepted_at: string | null;
          company_id: string;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string;
          status: string;
          team_role: string;
          token: string;
        };
        Insert: {
          accepted_at?: string | null;
          company_id: string;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by: string;
          status?: string;
          team_role?: string;
          token?: string;
        };
        Update: {
          accepted_at?: string | null;
          company_id?: string;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          status?: string;
          team_role?: string;
          token?: string;
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
      job_categories: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          industry_category_id: string | null;
          is_active: boolean;
          name: string;
          sort_order: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          industry_category_id?: string | null;
          is_active?: boolean;
          name: string;
          sort_order?: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          industry_category_id?: string | null;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "job_categories_industry_category_id_fkey";
            columns: ["industry_category_id"];
            isOneToOne: false;
            referencedRelation: "industry_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      job_subcategories: {
        Row: {
          category_id: string;
          code: string;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number;
        };
        Insert: {
          category_id: string;
          code: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          sort_order?: number;
        };
        Update: {
          category_id?: string;
          code?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "job_subcategories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "job_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      job_titles: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          sort_order: number;
          subcategory_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          sort_order?: number;
          subcategory_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
          subcategory_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_titles_subcategory_id_fkey";
            columns: ["subcategory_id"];
            isOneToOne: false;
            referencedRelation: "job_subcategories";
            referencedColumns: ["id"];
          },
        ];
      };
      job_applications: {
        Row: {
          applied_at: string;
          candidate_id: string;
          cover_letter: string | null;
          cover_letter_document_id: string | null;
          id: string;
          job_posting_id: string;
          references_attached: boolean;
          resume_document_id: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          applied_at?: string;
          candidate_id: string;
          cover_letter?: string | null;
          cover_letter_document_id?: string | null;
          id?: string;
          job_posting_id: string;
          references_attached?: boolean;
          resume_document_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          applied_at?: string;
          candidate_id?: string;
          cover_letter?: string | null;
          cover_letter_document_id?: string | null;
          id?: string;
          job_posting_id?: string;
          references_attached?: boolean;
          resume_document_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      job_postings: {
        Row: {
          category: string;
          closes_at: string | null;
          company_display_name: string;
          company_id: string | null;
          created_at: string;
          description: string;
          id: string;
          is_urgent: boolean;
          location: string;
          published_at: string | null;
          recruiter_id: string;
          requirements: string[];
          responsibilities: string[];
          salary_display: string | null;
          status: string;
          title: string;
          updated_at: string;
          work_type_id: string;
        };
        Insert: {
          category: string;
          closes_at?: string | null;
          company_display_name: string;
          company_id?: string | null;
          created_at?: string;
          description: string;
          id?: string;
          is_urgent?: boolean;
          location: string;
          published_at?: string | null;
          recruiter_id: string;
          requirements?: string[];
          responsibilities?: string[];
          salary_display?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
          work_type_id: string;
        };
        Update: {
          category?: string;
          closes_at?: string | null;
          company_display_name?: string;
          company_id?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          is_urgent?: boolean;
          location?: string;
          published_at?: string | null;
          recruiter_id?: string;
          requirements?: string[];
          responsibilities?: string[];
          salary_display?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
          work_type_id?: string;
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
          industries: string[];
          job_title: string | null;
          preferred_experience_levels: string[];
          preferred_work_type_codes: string[];
          profile_picture_url: string | null;
          recruiter_type: string | null;
          remote_preference: string | null;
          specialisations: string[];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          bio?: string | null;
          candidate_search_enabled?: boolean;
          company_id?: string | null;
          created_at?: string;
          id?: string;
          industries?: string[];
          job_title?: string | null;
          preferred_experience_levels?: string[];
          preferred_work_type_codes?: string[];
          profile_picture_url?: string | null;
          recruiter_type?: string | null;
          remote_preference?: string | null;
          specialisations?: string[];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          bio?: string | null;
          candidate_search_enabled?: boolean;
          company_id?: string | null;
          created_at?: string;
          id?: string;
          industries?: string[];
          job_title?: string | null;
          preferred_experience_levels?: string[];
          preferred_work_type_codes?: string[];
          profile_picture_url?: string | null;
          recruiter_type?: string | null;
          remote_preference?: string | null;
          specialisations?: string[];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      recruiter_saved_candidates: {
        Row: {
          candidate_id: string;
          id: string;
          recruiter_id: string;
          saved_at: string;
        };
        Insert: {
          candidate_id: string;
          id?: string;
          recruiter_id: string;
          saved_at?: string;
        };
        Update: {
          candidate_id?: string;
          id?: string;
          recruiter_id?: string;
          saved_at?: string;
        };
        Relationships: [];
      };
      reference_passport_shares: {
        Row: {
          candidate_id: string;
          created_at: string;
          expires_at: string | null;
          id: string;
          included_reference_ids: string[];
          is_active: boolean;
          permissions: Json;
          share_token: string;
          share_type: string;
          updated_at: string;
          view_count: number;
        };
        Insert: {
          candidate_id: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          included_reference_ids?: string[];
          is_active?: boolean;
          permissions?: Json;
          share_token?: string;
          share_type: string;
          updated_at?: string;
          view_count?: number;
        };
        Update: {
          candidate_id?: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          included_reference_ids?: string[];
          is_active?: boolean;
          permissions?: Json;
          share_token?: string;
          share_type?: string;
          updated_at?: string;
          view_count?: number;
        };
        Relationships: [];
      };
      reference_requests: {
        Row: {
          candidate_id: string;
          candidate_message: string | null;
          created_at: string;
          employment_end: string | null;
          employment_history_id: string | null;
          employment_start: string | null;
          id: string;
          invitation_expires_at: string;
          invitation_sent_at: string | null;
          invitation_token: string;
          referee_company: string;
          referee_email: string;
          referee_name: string;
          referee_phone: string | null;
          referee_title: string;
          referee_user_id: string | null;
          reference_type: string;
          require_company_email: boolean;
          rejection_reason: string | null;
          relationship: string;
          requested_by_recruiter_id: string | null;
          requested_by_type: string;
          requested_by_user_id: string;
          status: string;
          submitted_at: string | null;
          updated_at: string;
          verified_at: string | null;
          verified_by_user_id: string | null;
        };
        Insert: {
          candidate_id: string;
          candidate_message?: string | null;
          created_at?: string;
          employment_end?: string | null;
          employment_history_id?: string | null;
          employment_start?: string | null;
          id?: string;
          invitation_expires_at?: string;
          invitation_sent_at?: string | null;
          invitation_token?: string;
          referee_company: string;
          referee_email: string;
          referee_name: string;
          referee_phone?: string | null;
          referee_title: string;
          referee_user_id?: string | null;
          reference_type?: string;
          require_company_email?: boolean;
          rejection_reason?: string | null;
          relationship: string;
          requested_by_recruiter_id?: string | null;
          requested_by_type: string;
          requested_by_user_id: string;
          status?: string;
          submitted_at?: string | null;
          updated_at?: string;
          verified_at?: string | null;
          verified_by_user_id?: string | null;
        };
        Update: {
          candidate_id?: string;
          candidate_message?: string | null;
          created_at?: string;
          employment_end?: string | null;
          employment_history_id?: string | null;
          employment_start?: string | null;
          id?: string;
          invitation_expires_at?: string;
          invitation_sent_at?: string | null;
          invitation_token?: string;
          referee_company?: string;
          referee_email?: string;
          referee_name?: string;
          referee_phone?: string | null;
          referee_title?: string;
          referee_user_id?: string | null;
          reference_type?: string;
          require_company_email?: boolean;
          rejection_reason?: string | null;
          relationship?: string;
          requested_by_recruiter_id?: string | null;
          requested_by_type?: string;
          requested_by_user_id?: string;
          status?: string;
          submitted_at?: string | null;
          updated_at?: string;
          verified_at?: string | null;
          verified_by_user_id?: string | null;
        };
        Relationships: [];
      };
      reference_responses: {
        Row: {
          attestation_confirmed: boolean;
          employment_confirmed: boolean;
          employment_dates_confirmed: boolean;
          id: string;
          leadership_rating: number | null;
          performance_rating: number | null;
          position_held: string | null;
          questionnaire_responses: Json | null;
          reference_request_id: string;
          rehire_recommendation: boolean | null;
          reliability_rating: number | null;
          submitted_at: string;
          submitted_by_user_id: string;
          teamwork_rating: number | null;
          written_comments: string | null;
        };
        Insert: {
          attestation_confirmed?: boolean;
          employment_confirmed?: boolean;
          employment_dates_confirmed?: boolean;
          id?: string;
          leadership_rating?: number | null;
          performance_rating?: number | null;
          position_held?: string | null;
          questionnaire_responses?: Json | null;
          reference_request_id: string;
          rehire_recommendation?: boolean | null;
          reliability_rating?: number | null;
          submitted_at?: string;
          submitted_by_user_id: string;
          teamwork_rating?: number | null;
          written_comments?: string | null;
        };
        Update: {
          attestation_confirmed?: boolean;
          employment_confirmed?: boolean;
          employment_dates_confirmed?: boolean;
          id?: string;
          leadership_rating?: number | null;
          performance_rating?: number | null;
          position_held?: string | null;
          questionnaire_responses?: Json | null;
          reference_request_id?: string;
          rehire_recommendation?: boolean | null;
          reliability_rating?: number | null;
          submitted_at?: string;
          submitted_by_user_id?: string;
          teamwork_rating?: number | null;
          written_comments?: string | null;
        };
        Relationships: [];
      };
      reference_share_views: {
        Row: {
          id: string;
          share_id: string;
          viewed_at: string;
          viewer_user_id: string;
        };
        Insert: {
          id?: string;
          share_id: string;
          viewed_at?: string;
          viewer_user_id: string;
        };
        Update: {
          id?: string;
          share_id?: string;
          viewed_at?: string;
          viewer_user_id?: string;
        };
        Relationships: [];
      };
      reference_verifications: {
        Row: {
          created_at: string;
          id: string;
          metadata: Json | null;
          method: string;
          notes: string | null;
          reference_request_id: string;
          status: string;
          verified_by_user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          method: string;
          notes?: string | null;
          reference_request_id: string;
          status?: string;
          verified_by_user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          method?: string;
          notes?: string | null;
          reference_request_id?: string;
          status?: string;
          verified_by_user_id?: string | null;
        };
        Relationships: [];
      };
      connections: {
        Row: {
          connected_at: string | null;
          id: string;
          initiator_candidate_id: string | null;
          initiator_recruiter_id: string | null;
          initiator_type: string;
          message: string | null;
          participant_1_candidate_id: string | null;
          participant_1_recruiter_id: string | null;
          participant_1_type: string;
          participant_2_candidate_id: string | null;
          participant_2_recruiter_id: string | null;
          participant_2_type: string;
          requested_at: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          connected_at?: string | null;
          id?: string;
          initiator_candidate_id?: string | null;
          initiator_recruiter_id?: string | null;
          initiator_type: string;
          message?: string | null;
          participant_1_candidate_id?: string | null;
          participant_1_recruiter_id?: string | null;
          participant_1_type: string;
          participant_2_candidate_id?: string | null;
          participant_2_recruiter_id?: string | null;
          participant_2_type: string;
          requested_at?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          connected_at?: string | null;
          id?: string;
          initiator_candidate_id?: string | null;
          initiator_recruiter_id?: string | null;
          initiator_type?: string;
          message?: string | null;
          participant_1_candidate_id?: string | null;
          participant_1_recruiter_id?: string | null;
          participant_1_type?: string;
          participant_2_candidate_id?: string | null;
          participant_2_recruiter_id?: string | null;
          participant_2_type?: string;
          requested_at?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      password_reset_tokens: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          token_hash: string;
          used_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          expires_at: string;
          id?: string;
          token_hash: string;
          used_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          token_hash?: string;
          used_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      email_verification_tokens: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          token_hash: string;
          used_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          expires_at: string;
          id?: string;
          token_hash: string;
          used_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          token_hash?: string;
          used_at?: string | null;
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
      user_feedback: {
        Row: {
          can_contact: boolean;
          contact_email: string | null;
          created_at: string;
          details: string;
          feedback_type: string;
          id: string;
          new_feature_desc: string | null;
          new_feature_title: string | null;
          overall_rating: number;
          role: string;
          selected_feature: string | null;
          user_id: string;
        };
        Insert: {
          can_contact?: boolean;
          contact_email?: string | null;
          created_at?: string;
          details: string;
          feedback_type: string;
          id?: string;
          new_feature_desc?: string | null;
          new_feature_title?: string | null;
          overall_rating: number;
          role: string;
          selected_feature?: string | null;
          user_id: string;
        };
        Update: {
          can_contact?: boolean;
          contact_email?: string | null;
          created_at?: string;
          details?: string;
          feedback_type?: string;
          id?: string;
          new_feature_desc?: string | null;
          new_feature_title?: string | null;
          overall_rating?: number;
          role?: string;
          selected_feature?: string | null;
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
      get_own_recruiter_profile: {
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
      get_recruiter_saved_candidates: {
        Args: {
          p_offset?: number;
          p_limit?: number;
        };
        Returns: Json;
      };
      get_recruiter_saved_count: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      send_candidate_connection_request: {
        Args: {
          p_recruiter_id: string;
          p_message?: string;
        };
        Returns: Json;
      };
      send_candidate_peer_connection_request: {
        Args: {
          p_peer_candidate_id: string;
          p_message?: string;
        };
        Returns: Json;
      };
      get_candidate_connection_counts: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      get_recruiter_connection_counts: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      send_recruiter_connection_request: {
        Args: {
          p_candidate_id: string;
          p_message?: string;
        };
        Returns: Json;
      };
      send_recruiter_peer_connection_request: {
        Args: {
          p_peer_recruiter_id: string;
          p_message?: string;
        };
        Returns: Json;
      };
      get_recruiter_peer_connection_status: {
        Args: {
          p_peer_recruiter_id: string;
        };
        Returns: Json;
      };
      get_recruiter_candidate_connection_status: {
        Args: {
          p_candidate_id: string;
        };
        Returns: Json;
      };
      get_candidate_peer_connection_status: {
        Args: {
          p_peer_candidate_id: string;
        };
        Returns: Json;
      };
      respond_to_connection_request: {
        Args: {
          p_connection_id: string;
          p_action: string;
        };
        Returns: Json;
      };
      list_candidate_connections: {
        Args: {
          p_tab?: string;
          p_offset?: number;
          p_limit?: number;
        };
        Returns: Json;
      };
      list_recruiter_connections: {
        Args: {
          p_tab?: string;
          p_offset?: number;
          p_limit?: number;
        };
        Returns: Json;
      };
      search_recruiter_candidates: {
        Args: {
          p_query?: string;
          p_category_id?: string;
          p_availability_start?: string;
          p_availability_status?: string;
          p_work_type_codes?: string[];
          p_country?: string;
          p_experience_min?: number;
          p_experience_max?: number;
          p_min_references?: number;
          p_offset?: number;
          p_limit?: number;
        };
        Returns: Json;
      };
      get_recruiter_directory_filters: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      search_recruiters_for_candidates: {
        Args: {
          p_query?: string;
          p_category?: string;
          p_offset?: number;
          p_limit?: number;
        };
        Returns: Json;
      };
      get_recruiter_search_metadata: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      get_candidate_search_metadata: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      search_candidates_for_candidates: {
        Args: {
          p_query?: string;
          p_category_id?: string;
          p_availability_start?: string;
          p_availability_status?: string;
          p_work_type_codes?: string[];
          p_country?: string;
          p_experience_min?: number;
          p_experience_max?: number;
          p_min_references?: number;
          p_offset?: number;
          p_limit?: number;
        };
        Returns: Json;
      };
      register_candidate: {
        Args: {
          p_city: string;
          p_country: string;
          p_industry_category_id: string;
          p_job_title_id?: string;
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
      count_verified_references: {
        Args: {
          p_candidate_id: string;
        };
        Returns: number;
      };
      is_platform_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      auth_user_email: {
        Args: Record<PropertyKey, never>;
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
