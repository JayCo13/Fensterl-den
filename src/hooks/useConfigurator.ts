import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

// Types
export type Material = Tables<"materials">;
export type WoodType = Tables<"wood_types">;
export type Design = Tables<"designs">;
export type RalColor = Tables<"ral_colors">;
export type QuoteRequest = Tables<"quote_requests">;
export type QuoteRequestInsert = TablesInsert<"quote_requests">;

// Fetch materials
export const useMaterials = () => {
    return useQuery({
        queryKey: ["materials"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("materials")
                .select("*")
                .order("name");

            if (error) throw error;
            return data as Material[];
        },
    });
};

// Fetch wood types
export const useWoodTypes = () => {
    return useQuery({
        queryKey: ["wood_types"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("wood_types")
                .select("*")
                .order("sort_order");

            if (error) throw error;
            return data as WoodType[];
        },
    });
};

// Fetch designs by material
export const useDesigns = (material?: string) => {
    return useQuery({
        queryKey: ["designs", material],
        queryFn: async () => {
            let query = supabase
                .from("designs")
                .select("*")
                .order("sort_order");

            if (material) {
                query = query.eq("material", material);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Design[];
        },
    });
};

// Fetch popular RAL colors
export const useRalColors = (popularOnly = true) => {
    return useQuery({
        queryKey: ["ral_colors", popularOnly],
        queryFn: async () => {
            let query = supabase
                .from("ral_colors")
                .select("*")
                .order("sort_order");

            if (popularOnly) {
                query = query.eq("is_popular", true);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as RalColor[];
        },
    });
};

// Submit quote request
export const useSubmitQuoteRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (quoteRequest: QuoteRequestInsert) => {
            const { data, error } = await supabase
                .from("quote_requests")
                .insert(quoteRequest)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quote_requests"] });
        },
    });
};
