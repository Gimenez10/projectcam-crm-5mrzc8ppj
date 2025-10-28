// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5'
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          created_at: string
          details: Json | null
          id: string
          target_user_id: string | null
          target_user_name: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
          target_user_name?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
          target_user_name?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          cpf_cnpj: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          state: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          state?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          state?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          description: string
          event_type: string
          id: string
          is_enabled: boolean
          recipients: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          event_type: string
          id?: string
          is_enabled?: boolean
          recipients?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          is_enabled?: boolean
          recipients?: Json
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          internal_code: string | null
          name: string
          price: number | null
          product_code: string
          serial_number: string | null
          stock: number | null
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          internal_code?: string | null
          name: string
          price?: number | null
          product_code: string
          serial_number?: string | null
          stock?: number | null
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          internal_code?: string | null
          name?: string
          price?: number | null
          product_code?: string
          serial_number?: string | null
          stock?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          dashboard_layout: Json | null
          full_name: string | null
          id: string
          role: Database['public']['Enums']['user_role']
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          dashboard_layout?: Json | null
          full_name?: string | null
          id: string
          role?: Database['public']['Enums']['user_role']
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          dashboard_layout?: Json | null
          full_name?: string | null
          id?: string
          role?: Database['public']['Enums']['user_role']
          updated_at?: string
        }
        Relationships: []
      }
      service_order_items: {
        Row: {
          code: string | null
          description: string
          discount: number
          id: string
          quantity: number
          service_order_id: string
          unit_price: number
        }
        Insert: {
          code?: string | null
          description: string
          discount?: number
          id?: string
          quantity: number
          service_order_id: string
          unit_price: number
        }
        Update: {
          code?: string | null
          description?: string
          discount?: number
          id?: string
          quantity?: number
          service_order_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: 'service_order_items_service_order_id_fkey'
            columns: ['service_order_id']
            isOneToOne: false
            referencedRelation: 'service_orders'
            referencedColumns: ['id']
          },
        ]
      }
      service_orders: {
        Row: {
          approval_comments: string | null
          approval_status: Database['public']['Enums']['approval_status'] | null
          approver_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          global_discount: number
          id: string
          observations: string | null
          order_number: number
          payment_conditions: string | null
          requested_at: string | null
          status: Database['public']['Enums']['service_order_status']
          title: string | null
          total_value: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          approval_comments?: string | null
          approval_status?:
            | Database['public']['Enums']['approval_status']
            | null
          approver_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          global_discount?: number
          id?: string
          observations?: string | null
          order_number?: number
          payment_conditions?: string | null
          requested_at?: string | null
          status?: Database['public']['Enums']['service_order_status']
          title?: string | null
          total_value?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          approval_comments?: string | null
          approval_status?:
            | Database['public']['Enums']['approval_status']
            | null
          approver_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          global_discount?: number
          id?: string
          observations?: string | null
          order_number?: number
          payment_conditions?: string | null
          requested_at?: string | null
          status?: Database['public']['Enums']['service_order_status']
          title?: string | null
          total_value?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'service_orders_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: Database['public']['Enums']['user_role']
      }
    }
    Enums: {
      approval_status: 'Pendente' | 'Aprovado' | 'Rejeitado'
      service_order_status:
        | 'Rascunho'
        | 'Pendente'
        | 'Aprovado'
        | 'Rejeitado'
        | 'Fechado'
      user_role: 'admin' | 'manager' | 'seller'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      approval_status: ['Pendente', 'Aprovado', 'Rejeitado'],
      service_order_status: [
        'Rascunho',
        'Pendente',
        'Aprovado',
        'Rejeitado',
        'Fechado',
      ],
      user_role: ['admin', 'manager', 'seller'],
    },
  },
} as const
