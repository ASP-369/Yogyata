// institutionService.js
// Service functions for institution-related operations
import { supabase } from "../config/supabase";

/**
 * Fetch institution ranking based on average teacher reputation.
 * Uses the institution_reputation view in Supabase.
 */
export async function fetchInstitutionRanking() {
    const { data, error } = await supabase
        .from("institution_reputation")
        .select("*")
        .order("avg_rep", { ascending: false });

    if (error) {
        console.error("Error fetching institution ranking:", error);
        throw error;
    }

    return data ?? [];
}

/**
 * Fetch verified institutions for dropdown
 */
export async function fetchVerifiedInstitutions() {
    const { data, error } = await supabase
        .from("Institution")
        .select("id, name")
        .eq("verified", true)
        .order("name");

    if (error) {
        console.error("Error fetching institutions:", error);
        throw error;
    }

    return data ?? [];
}

/**
 * Register a new institution (unverified)
 */
export async function registerInstitution(name, address) {
    const { data, error } = await supabase
        .from("Institution")
        .insert([{
            name: name.trim(),
            address: address.trim(),
            verified: null,
        }])
        .select()
        .single();

    if (error) {
        console.error("Error registering institution:", error);
        throw error;
    }

    return data;
}

/**
 * Fetch teacher by user ID
 */
export async function fetchTeacher(userId) {
    const { data, error } = await supabase
        .from("Teacher")
        .select("*")
        .eq("id", userId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error("Error fetching teacher:", error);
        throw error;
    }

    return data;
}
