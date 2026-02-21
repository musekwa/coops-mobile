-- Create table for actor categories
create table if not exists
    public.actor_categories (
        id uuid not null default gen_random_uuid(),
        actor_id uuid not null,
        category text not null check (category in ('FARMER', 'TRADER', 'GROUP', 'WORKER', 'GROUP_MANAGER', 'EMPLOYEE')),
        subcategory text not null,
        sync_id text not null,
        constraint actor_categories_pkey primary key (id),
        constraint actor_categories_actor_id_unique unique (actor_id, category, subcategory),
        constraint actor_categories_actor_id_fkey foreign key (actor_id) references actors(id) on delete cascade
    ) tablespace pg_default;

-- Create table for genders
create table if not exists
    public.genders (
        id uuid not null default gen_random_uuid(),
        actor_id uuid not null, -- foreign key to actors table
        name text not null,
        code text not null,
        sync_id text not null,
        constraint genders_pkey primary key (id),
        constraint genders_actor_id_fkey foreign key (actor_id) references actors(id) on delete cascade
    ) tablespace pg_default;


-- Create table for dependents
create table if not exists
    public.dependents (
        id uuid not null default gen_random_uuid(),
        actor_id uuid not null, -- foreign key to actors table
        number_of_dependents integer not null,
        sync_id text not null,
        constraint dependents_pkey primary key (id),
        constraint dependents_actor_id_fkey foreign key (actor_id) references actors(id) on delete cascade
    ) tablespace pg_default;

-- Create table for actor details
create table if not exists
    public.actor_details (
        id uuid not null default gen_random_uuid(),
        actor_id uuid not null, -- foreign key to actors table
        surname text not null,
        other_names text not null,
        uaid text not null,
        photo text,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now(),
        sync_id text not null,
        constraint actor_details_uaid_unique unique (uaid),
        constraint actor_details_pkey primary key (id),
        constraint actor_details_actor_id_fkey foreign key (actor_id) references actors(id) on delete cascade 
    ) tablespace pg_default;


-- Create table for group_manager_assignments
create table if not exists
    public.group_manager_assignments (
        id uuid not null default gen_random_uuid(),
        group_manager_id uuid not null,
        group_id uuid not null,
        position text not null,
        is_active text not null default 'true' check (is_active IN ('true', 'false')),
        sync_id text not null,
        constraint group_manager_assignments_pkey primary key (id),
        constraint group_manager_assignments_group_manager_id_fkey foreign key (group_manager_id) references actors(id) on delete cascade,
        constraint group_manager_assignments_group_id_fkey foreign key (group_id) references actors(id) on delete cascade,
        constraint unique_group_manager_group_active unique (group_manager_id, group_id, is_active)
    )



-- Create table for worker_assignments
create table if not exists
    public.worker_assignments (
    id uuid not null default gen_random_uuid(),
    worker_id uuid not null,
    facility_id uuid not null,
    facility_type text not null check (facility_type IN ('FARM', 'WAREHOUSE', 'GROUP', 'FACTORY', 'NURSERY')),
    position text not null,
    is_active text not null default 'true' check (is_active IN ('true', 'false')),
    sync_id text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    constraint worker_assignments_pkey primary key (id),
    constraint worker_assignments_worker_id_fkey foreign key (worker_id) references actors(id) on delete cascade,
    constraint worker_assignments_facility_id_fkey foreign key (facility_id) references facilities(id) on delete cascade,
    constraint unique_worker_facility_active unique (worker_id, facility_id, is_active)
) tablespace pg_default;


alter table public.actor_details
    disable row level security;

alter table public.genders
    disable row level security;

alter table public.dependents
    disable row level security;

alter table public.actor_categories
    disable row level security;

alter table public.worker_assignments
    disable row level security;

alter table public.checkpoints
    disable row level security;

