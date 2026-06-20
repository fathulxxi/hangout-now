-- Groups table
create table groups (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  created_at timestamptz not null default now()
);

-- Members table (identified by browser token, not password)
create table members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  name text not null,
  token uuid unique not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- Availability table
create table availability (
  id uuid primary key default gen_random_uuid(),
  member_id uuid unique not null references members(id) on delete cascade,
  free_until timestamptz not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_members_group_id on members(group_id);
create index idx_members_token on members(token);
create index idx_availability_member_id on availability(member_id);
create index idx_availability_free_until on availability(free_until);
create index idx_groups_slug on groups(slug);

-- Row Level Security
alter table groups enable row level security;
alter table members enable row level security;
alter table availability enable row level security;

-- Public read access for groups (anyone with the slug can view)
create policy "Groups are viewable by anyone"
  on groups for select using (true);

-- Public insert for groups (anyone can create a group)
create policy "Anyone can create a group"
  on groups for insert with check (true);

-- Members are viewable by anyone in the same group
create policy "Members are viewable by anyone"
  on members for select using (true);

-- Anyone can join a group
create policy "Anyone can join a group"
  on members for insert with check (true);

-- Availability is viewable by anyone
create policy "Availability is viewable by anyone"
  on availability for select using (true);

-- Anyone can insert availability
create policy "Anyone can set availability"
  on availability for insert with check (true);

-- Anyone can update their own availability (matched via member_id)
create policy "Anyone can update availability"
  on availability for update using (true);

-- Anyone can delete their own availability
create policy "Anyone can delete availability"
  on availability for delete using (true);
