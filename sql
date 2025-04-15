create table program_choices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  age_range text,
  body_type text,
  gender text,
  goal text,
  fitness_level text,
  injury_status text,
  location text,
  time_commitment text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
