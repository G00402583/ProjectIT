//  reusable Supabase client across all pages

export const SB_URL = "https://kqzevnsdurpptiaxszqq.supabase.co";
export const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxemV2bnNkdXJwcHRpYXhzenFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMjA4NDYsImV4cCI6MjA1OTU5Njg0Nn0.eM-M08VulR5HiwKs-t7y2xehqUwBJPW0dnKENxMvArg";
  //  anon key

export const sb = supabase.createClient(SB_URL, SB_KEY);
