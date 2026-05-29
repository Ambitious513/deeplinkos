-- Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT
);

-- Deep Links Table (migrated from Prisma)
CREATE TABLE deep_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  preset TEXT NOT NULL DEFAULT 'custom',
  status TEXT NOT NULL DEFAULT 'active',
  ios_deep_link TEXT,
  ios_store_url TEXT,
  android_deep_link TEXT,
  android_store_url TEXT,
  desktop_url TEXT,
  routing_config JSONB,
  metadata JSONB,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Clicks Table
CREATE TABLE clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES deep_links(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT now(),
  country TEXT,
  city TEXT,
  device TEXT,
  os TEXT,
  browser TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_hash TEXT
);

-- Domains Table
CREATE TABLE domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_name TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deep_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Deep Links Policies
CREATE POLICY "Public can view active links" ON deep_links FOR SELECT USING (is_active = true OR status = 'active');
CREATE POLICY "Users can view own links" ON deep_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own links" ON deep_links FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own links" ON deep_links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own links" ON deep_links FOR DELETE USING (auth.uid() = user_id);

-- Clicks Policies
CREATE POLICY "Anyone can insert clicks" ON clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view clicks for their links" ON clicks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM deep_links WHERE deep_links.id = clicks.link_id AND deep_links.user_id = auth.uid()
  )
);

-- Domains Policies
CREATE POLICY "Users can manage own domains" ON domains FOR ALL USING (auth.uid() = user_id);

-- Trigger to automatically create profile on signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
