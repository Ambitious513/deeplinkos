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

-- 1. Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_clicks_link_timestamp ON clicks (link_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_clicks_ip_hash ON clicks (ip_hash);

-- 2. RPC: Get Dashboard Analytics Summary (Total Clicks, Unique Visitors, Active Links)
CREATE OR REPLACE FUNCTION get_dashboard_analytics(user_uuid UUID, days_ago INT)
RETURNS TABLE (
  total_clicks BIGINT,
  unique_visitors BIGINT,
  active_links BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH user_links AS (
    SELECT id, is_active FROM deep_links WHERE user_id = user_uuid
  ),
  active_count AS (
    SELECT COUNT(*) AS count FROM user_links WHERE is_active = true
  ),
  clicks_data AS (
    SELECT ip_hash 
    FROM clicks 
    WHERE link_id IN (SELECT id FROM user_links) 
      AND timestamp >= NOW() - (days_ago || ' days')::interval
  )
  SELECT 
    (SELECT COUNT(*) FROM clicks_data) AS total_clicks,
    (SELECT COUNT(DISTINCT ip_hash) FROM clicks_data) AS unique_visitors,
    (SELECT count FROM active_count) AS active_links;
END;
$$;

-- 3. RPC: Get Chart Data (Clicks per day for the last N days)
CREATE OR REPLACE FUNCTION get_clicks_by_day(user_uuid UUID, days_ago INT)
RETURNS TABLE (
  click_date DATE,
  click_count BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(timestamp) AS click_date,
    COUNT(*) AS click_count
  FROM clicks
  WHERE link_id IN (SELECT id FROM deep_links WHERE user_id = user_uuid)
    AND timestamp >= NOW() - (days_ago || ' days')::interval
  GROUP BY DATE(timestamp)
  ORDER BY click_date ASC;
END;
$$;

-- 4. RPC: Get Global Analytics Breakdown (Top links, Devices, Referrers)
CREATE OR REPLACE FUNCTION get_global_analytics(user_uuid UUID)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
  result JSON;
BEGIN
  WITH user_links AS (
    SELECT id, title, slug FROM deep_links WHERE user_id = user_uuid
  ),
  device_counts AS (
    SELECT device, COUNT(*) as count
    FROM clicks
    WHERE link_id IN (SELECT id FROM user_links)
      AND device IS NOT NULL
    GROUP BY device
    ORDER BY count DESC
  ),
  referrer_counts AS (
    SELECT referrer, COUNT(*) as count
    FROM clicks
    WHERE link_id IN (SELECT id FROM user_links)
      AND referrer IS NOT NULL
      AND referrer != ''
    GROUP BY referrer
    ORDER BY count DESC
    LIMIT 10
  ),
  top_links AS (
    SELECT l.id, l.title, l.slug, COUNT(c.id) as count
    FROM user_links l
    LEFT JOIN clicks c ON c.link_id = l.id
    GROUP BY l.id, l.title, l.slug
    ORDER BY count DESC
    LIMIT 5
  )
  SELECT json_build_object(
    'devices', (SELECT COALESCE(json_agg(row_to_json(d)), '[]'::json) FROM device_counts d),
    'referrers', (SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json) FROM referrer_counts r),
    'top_links', (SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM top_links t)
  ) INTO result;
  
  RETURN result;
END;
$$;
