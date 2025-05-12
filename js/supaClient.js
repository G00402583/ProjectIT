//  reusable Supabase client across all pages

export const SB_URL = "#";
export const SB_KEY = "#";
  //  anon key

export const sb = supabase.createClient(SB_URL, SB_KEY);
