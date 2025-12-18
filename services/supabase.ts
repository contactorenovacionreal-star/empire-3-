
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { EBookTier } from '../types';

// Access environment variables directly. 
// These must be set in your deployment environment (e.g., secrets or .env)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// We only initialize if we have the credentials to prevent the "supabaseUrl is required" crash.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabaseService = {
  // Helper to check if Supabase is configured
  isConfigured: () => !!supabase,

  // Crea la orden cuando llega el Webhook de Hotmart (vía Make.com)
  createOrderFromWebhook: async (data: { email: string, name: string, tier: string, orderId: string, niche?: string }) => {
    if (!supabase) throw new Error("Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.");
    
    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        id: data.orderId,
        customer_email: data.email,
        customer_name: data.name,
        tier: data.tier,
        niche: data.niche || 'General',
        status: 'pending_form',
        progress: 0
      }])
      .select();

    if (error) {
      console.error('Error creando orden:', error);
      throw error;
    }
    return { success: true, data: order };
  },

  // Obtiene la orden para el cliente final (PublicForm)
  getOrder: async (orderId: string) => {
    if (!supabase) {
      console.warn("Supabase not configured, returning mock data.");
      return {
        id: orderId,
        customerName: 'Explorador Empire (Mock)',
        customerEmail: 'test@empire.ai',
        tier: EBookTier.TIER_3,
        niche: 'Biohacking',
        status: 'pending_form',
        progress: 0,
        ebookContent: null
      };
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !data) {
      return {
        id: orderId,
        customerName: 'Explorador Empire',
        customerEmail: 'test@empire.ai',
        tier: EBookTier.TIER_3,
        niche: 'Biohacking',
        status: 'pending_form'
      };
    }
    
    return {
      id: data.id,
      customerName: data.customer_name,
      customerEmail: data.customer_email,
      tier: data.tier,
      niche: data.niche,
      status: data.status,
      progress: data.progress,
      ebookContent: data.ebook_content
    };
  },

  // Actualiza el porcentaje de escritura de la IA en tiempo real
  updateOrderStatus: async (orderId: string, status: string, progress: number) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('orders')
      .update({ status, progress })
      .eq('id', orderId);

    if (error) console.error('Error sync status:', error);
  },

  // Guarda el EBook final (JSON masivo con capítulos e imágenes)
  saveEBook: async (orderId: string, ebook: any) => {
    if (!supabase) {
      console.log("Mock save EBook:", ebook);
      return { success: true };
    }
    const { error } = await supabase
      .from('orders')
      .update({ 
        ebook_content: ebook,
        status: 'completed',
        progress: 100
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error guardando ebook:', error);
      throw error;
    }
    return { success: true };
  },

  // Obtiene todas las órdenes para el Admin Dashboard
  getAllOrders: async () => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return data.map(d => ({
      id: d.id,
      name: d.customer_name,
      email: d.customer_email,
      tier: d.tier,
      niche: d.niche,
      status: d.status,
      progress: d.progress,
      createdAt: d.created_at
    }));
  }
};
