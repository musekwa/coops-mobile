-- Countries table
create table public.countries (
  id uuid not null default gen_random_uuid (),
  name text not null,
  initials text not null,
  code text not null,
  sync_id text not null,
  constraint countries_pkey primary key (id),
  constraint countries_code_unique unique (code)
) TABLESPACE pg_default;

-- Provinces table
create table public.provinces (
  id uuid not null default gen_random_uuid (),
  name text not null,
  initials text not null,
  code text not null,
  country_id uuid not null,
  sync_id text not null,
  constraint provinces_pkey primary key (id),
  constraint provinces_code_unique unique (code),
  constraint provinces_country_id_fkey foreign KEY (country_id) references countries (id) on delete set null
) TABLESPACE pg_default;




-- Districts table
create table public.districts (
  id uuid not null default gen_random_uuid (),
  name text not null,
  code text not null,
  province_id uuid not null,
  sync_id text not null,
  constraint districts_pkey primary key (id),
  constraint districts_code_unique unique (code),
  constraint districts_province_id_fkey foreign KEY (province_id) references provinces (id) on delete set null
) TABLESPACE pg_default;




-- Admininistrative Posts table
create table public.admin_posts (
  id uuid not null default gen_random_uuid (),
  name text not null,
  code text not null,
  district_id uuid not null,
  sync_id text not null,
  constraint admin_posts_pkey primary key (id),
  constraint admin_posts_code_unique unique (code),
  constraint admin_posts_district_id_fkey foreign KEY (district_id) references districts (id) on delete set null
) TABLESPACE pg_default;


-- Villages table
create table public.villages (
  id uuid not null default gen_random_uuid (),
  name text not null,
  code text not null,
  admin_post_id uuid not null,
  sync_id text not null,
  constraint villages_pkey primary key (id),
  constraint villages_code_unique unique (code),
  constraint villages_admin_post_id_fkey foreign KEY (admin_post_id) references admin_posts (id) on delete set null
) TABLESPACE pg_default;



-- User details table
create table public.user_details (
  id uuid not null default gen_random_uuid (),
  full_name text not null,
  email text not null,
  phone text not null,
  district_id uuid not null,
  province_id uuid not null,
  user_role text not null,
  user_id uuid not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  status text not null default 'pending_email_verification'::text,
  constraint user_details_pkey primary key (id),
  constraint user_details_district_id_fkey foreign KEY (district_id) references districts (id),
  constraint user_details_province_id_fkey foreign KEY (province_id) references provinces (id),
  constraint user_details_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete set null
) TABLESPACE pg_default;

-- Actors table
create table public.actors (
  id uuid not null default gen_random_uuid (),
  category text not null,
  sync_id text not null,
  constraint actors_pkey primary key (id),
  constraint actors_category_check check (
    (
      category = any (
        array[
          'FARMER'::text,
          'TRADER'::text,
          'GROUP'::text,
          'EMPLOYEE'::text,
          'GROUP_MANAGER'::text,
          'DRIVER'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;


-- Actor details table
create table public.actor_details (
  id uuid not null default gen_random_uuid (),
  actor_id uuid not null,
  surname text not null,
  other_names text not null,
  uaid text not null,
  photo text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  sync_id text not null,
  constraint actor_details_pkey primary key (id),
  constraint actor_details_uaid_unique unique (uaid),
  constraint actor_details_actor_id_fkey foreign KEY (actor_id) references actors (id) on delete CASCADE
) TABLESPACE pg_default;


-- Actor categories table
create table public.actor_categories (
  id uuid not null default gen_random_uuid (),
  actor_id uuid not null,
  category text not null,
  subcategory text not null,
  sync_id text not null,
  constraint actor_categories_pkey primary key (id),
  constraint actor_categories_actor_id_unique unique (actor_id, category, subcategory),
  constraint actor_categories_actor_id_fkey foreign KEY (actor_id) references actors (id) on delete CASCADE,
  constraint actor_categories_category_check check (
    (
      category = any (
        array[
          'FARMER'::text,
          'TRADER'::text,
          'GROUP'::text,
          'WORKER'::text,
          'GROUP_MANAGER'::text,
          'EMPLOYEE'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;


-- Address details table
create table public.address_details (
  id uuid not null default gen_random_uuid (),
  owner_id uuid not null,
  owner_type text not null,
  village_id uuid not null,
  admin_post_id uuid not null,
  district_id uuid not null,
  province_id uuid not null,
  gps_lat text not null,
  gps_long text not null,
  sync_id text not null,
  constraint address_details_pkey primary key (id),
  constraint address_details_admin_post_id_fkey foreign KEY (admin_post_id) references admin_posts (id) on delete set null,
  constraint address_details_district_id_fkey foreign KEY (district_id) references districts (id) on delete set null,
  constraint address_details_province_id_fkey foreign KEY (province_id) references provinces (id) on delete set null,
  constraint address_details_village_id_fkey foreign KEY (village_id) references villages (id) on delete set null,
  constraint address_details_owner_type_check check (
    (
      owner_type = any (
        array[
          'FARMER'::text,
          'TRADER'::text,
          'GROUP'::text,
          'EMPLOYEE'::text,
          'GROUP_MANAGER'::text,
          'WAREHOUSE'::text,
          'CASHEW_SHIPMENT'::text,
          'CHECKPOINT'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;



-- Birth dates table
create table public.birth_dates (
  id uuid not null default gen_random_uuid (),
  owner_id uuid not null,
  owner_type text not null,
  day integer not null,
  month integer not null,
  year integer not null,
  sync_id text not null,
  constraint birth_dates_pkey primary key (id),
  constraint unique_birth_date_owner_id_owner_type unique (owner_id, owner_type),
  constraint birth_dates_owner_type_check check (
    (
      owner_type = any (
        array['FARMER'::text, 'TRADER'::text, 'GROUP'::text]
      )
    )
  )
) TABLESPACE pg_default;


-- Birth places table
create table public.birth_places (
  id uuid not null default gen_random_uuid (),
  owner_id uuid not null,
  owner_type text not null,
  place_id uuid not null,
  place_type text not null,
  description text not null,
  sync_id text not null,
  constraint birth_places_pkey primary key (id),
  constraint unique_birth_place_owner_id_owner_type unique (owner_id, owner_type),
  constraint birth_places_owner_type_check check (
    (
      owner_type = any (array['FARMER'::text, 'TRADER'::text])
    )
  ),
  constraint birth_places_place_type_check check (
    (
      place_type = any (
        array[
          'VILLAGE'::text,
          'ADMIN_POST'::text,
          'DISTRICT'::text,
          'PROVINCE'::text,
          'COUNTRY'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;


-- Genders table
create table public.genders (
  id uuid not null default gen_random_uuid (),
  actor_id uuid not null,
  name text not null,
  code text not null,
  sync_id text not null,
  constraint genders_pkey primary key (id),
  constraint genders_actor_id_fkey foreign KEY (actor_id) references actors (id) on delete CASCADE
) TABLESPACE pg_default;


-- Contact details table
create table public.contact_details (
  id uuid not null default gen_random_uuid (),
  owner_id uuid not null,
  owner_type text not null,
  primary_phone text not null,
  secondary_phone text not null,
  email text not null,
  sync_id text not null,
  constraint contact_details_pkey primary key (id),
  constraint unique_contact_details_owner_id_owner_type unique (owner_id, owner_type),
  constraint contact_details_owner_type_check check (
    (
      owner_type = any (
        array[
          'FARMER'::text,
          'TRADER'::text,
          'GROUP'::text,
          'EMPLOYEE'::text,
          'GROUP_MANAGER'::text,
          'DRIVER'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;


-- Facilities table
create table public.facilities (
  id uuid not null default gen_random_uuid (),
  name text not null,
  type text not null,
  owner_id uuid not null,
  sync_id text not null,
  constraint facilities_pkey primary key (id),
  constraint facilities_owner_id_fkey foreign KEY (owner_id) references actors (id) on delete CASCADE,
  constraint facilities_type_check check (
    (
      type = any (
        array[
          'FARM'::text,
          'WAREHOUSE'::text,
          'GROUP'::text,
          'FACTORY'::text,
          'NURSERY'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;


-- Group members table
create table public.group_members (
  id uuid not null default gen_random_uuid (),
  group_id uuid not null,
  member_id uuid not null,
  member_type text not null,
  sync_id text not null,
  constraint group_members_pkey primary key (id),
  constraint group_members_groups_id_fkey foreign KEY (group_id) references actors (id) on delete RESTRICT,
  constraint group_members_member_type_check check (
    (
      member_type = any (array['FARMER'::text, 'GROUP'::text])
    )
  )
) TABLESPACE pg_default;


-- Group managers table
create table public.group_managers (
  id uuid not null default gen_random_uuid (),
  group_id uuid not null,
  full_name text not null,
  position text not null,
  photo text null,
  contact_id uuid not null,
  address_id uuid not null,
  sync_id text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint group_managers_pkey primary key (id),
  constraint group_managers_groups_id_fkey foreign KEY (group_id) references actors (id) on delete CASCADE
) TABLESPACE pg_default;


-- Group manager assignments table
create table public.group_manager_assignments (
  id uuid not null default gen_random_uuid (),
  group_manager_id uuid not null,
  group_id uuid not null,
  position text not null,
  is_active text not null default 'true'::text,
  sync_id text not null,
  constraint group_manager_assignments_pkey primary key (id),
  constraint unique_group_manager_group_active unique (group_manager_id, group_id, is_active),
  constraint group_manager_assignments_group_id_fkey foreign KEY (group_id) references actors (id) on delete CASCADE,
  constraint group_manager_assignments_group_manager_id_fkey foreign KEY (group_manager_id) references actors (id) on delete CASCADE,
  constraint group_manager_assignments_is_active_check check (
    (
      is_active = any (array['true'::text, 'false'::text])
    )
  )
) TABLESPACE pg_default;


-- Identification documents table
create table public.identification_documents (
  id uuid not null default gen_random_uuid (),
  document_type text not null,
  document_number text not null,
  issue_date text not null,
  expiration_date text not null,
  issue_place text not null,
  updated_at timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  created_by text not null,
  updated_by text not null,
  sync_id text not null,
  owner_id uuid not null,
  owner_type text not null,
  constraint identification_documents_pkey primary key (id),
  constraint identification_documents_document_number_unique unique (document_number),
  constraint owner_type_check check (
    (
      owner_type = any (
        array['GROUP'::text, 'FARMER'::text, 'TRADER'::text]
      )
    )
  )
) TABLESPACE pg_default;


-- Licenses table
create table public.licenses (
  id uuid not null default gen_random_uuid (),
  photo text null,
  owner_type text not null,
  owner_id uuid not null,
  number text not null,
  issue_date text not null,
  expiration_date text not null,
  issue_place_id uuid not null,
  issue_place_type text not null,
  sync_id text not null,
  constraint licenses_pkey primary key (id),
  constraint licenses_number_unique unique (number, owner_type, owner_id),
  constraint licenses_issue_place_type_check check (
    (
      issue_place_type = any (
        array[
          'VILLAGE'::text,
          'ADMIN_POST'::text,
          'DISTRICT'::text,
          'PROVINCE'::text,
          'COUNTRY'::text
        ]
      )
    )
  ),
  constraint licenses_owner_type_check check (
    (
      owner_type = any (
        array[
          'FARMER'::text,
          'TRADER'::text,
          'CASHEW_SHIPMENT'::text,
          'GROUP'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;


-- Nuels table
create table public.nuels (
  id uuid not null default gen_random_uuid (),
  actor_id uuid not null,
  nuel text not null,
  sync_id text not null,
  constraint nuels_pkey primary key (actor_id, id),
  constraint nuels_nuel_unique unique (nuel),
  constraint nuels_nuel_check check (
    (
      (length(nuel) = 9)
      and (nuel ~ '^[0-9]{9}$'::text)
    )
  )
) TABLESPACE pg_default;


-- Nuits table
create table public.nuits (
  id uuid not null default gen_random_uuid (),
  actor_id uuid not null,
  nuit text not null,
  sync_id text not null,
  constraint nuits_pkey primary key (actor_id, id),
  constraint nuits_nuit_unique unique (nuit),
  constraint nuits_nuit_check check (
    (
      (length(nuit) = 9)
      and (nuit ~ '^[0-9]{9}$'::text)
    )
  )
) TABLESPACE pg_default;



-- Organization transactions table
create table public.organization_transactions (
  id uuid not null default gen_random_uuid (),
  transaction_type text not null,
  quantity integer not null,
  unit_price double precision not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  store_id uuid not null,
  confirmed text not null,
  reference_store_id uuid not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  created_by text not null,
  updated_by text not null,
  sync_id text not null,
  info_provider_id uuid not null,
  constraint organization_transactions_pkey primary key (id),
  constraint organization_transactions_reference_store_id_fkey foreign KEY (reference_store_id) references actors (id) on delete set null,
  constraint organization_transactions_store_id_fkey foreign KEY (store_id) references actors (id) on delete set null
) TABLESPACE pg_default;


-- Organization transaction participants table
create table public.organization_transaction_participants (
  id uuid not null default gen_random_uuid (),
  transaction_id uuid not null,
  quantity integer not null,
  participant_id uuid not null,
  sync_id text not null,
  participant_type text not null,
  constraint transaction_participants_pkey primary key (id),
  constraint transaction_participants_transactions_id_fkey foreign KEY (transaction_id) references organization_transactions (id) on delete set null,
  constraint participant_type_check check (
    (
      participant_type = any (array['GROUP'::text, 'FARMER'::text])
    )
  )
) TABLESPACE pg_default;


-- Worker assignments table
create table public.worker_assignments (
  id uuid not null default gen_random_uuid (),
  worker_id uuid not null,
  facility_id uuid not null,
  facility_type text not null,
  position text not null,
  is_active text not null default 'true'::text,
  sync_id text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint worker_assignments_pkey primary key (id),
  constraint unique_worker_facility_active unique (worker_id, facility_id, is_active),
  constraint worker_assignments_facility_id_fkey foreign KEY (facility_id) references facilities (id) on delete CASCADE,
  constraint worker_assignments_worker_id_fkey foreign KEY (worker_id) references actors (id) on delete CASCADE,
  constraint worker_assignments_facility_type_check check (
    (
      facility_type = any (
        array[
          'FARM'::text,
          'WAREHOUSE'::text,
          'GROUP'::text,
          'FACTORY'::text,
          'NURSERY'::text
        ]
      )
    )
  ),
  constraint worker_assignments_is_active_check check (
    (
      is_active = any (array['true'::text, 'false'::text])
    )
  )
) TABLESPACE pg_default;



-- Warehouse details table
create table public.warehouse_details (
  id uuid not null,
  name text not null,
  description text not null,
  owner_id uuid not null,
  type text not null,
  sync_id text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  is_active text not null default 'true'::text,
  constraint warehouse_details_pkey primary key (id),
  constraint warehouse_details_id_fkey foreign KEY (id) references facilities (id) on delete CASCADE,
  constraint warehouse_details_owner_id_fkey foreign KEY (owner_id) references actors (id) on delete CASCADE,
  constraint warehouse_details_is_active_check check (
    (
      is_active = any (array['true'::text, 'false'::text])
    )
  ),
  constraint warehouse_details_type_check check (
    (
      type = any (
        array[
          'BUYING'::text,
          'DESTINATION'::text,
          'AGGREGATION'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;



-- Cashew warehouse transactions table
create table public.cashew_warehouse_transactions (
  id uuid not null default gen_random_uuid (),
  transaction_type text not null,
  quantity integer not null,
  unit_price double precision not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  store_id uuid not null,
  reference_store_id uuid not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  created_by text not null,
  sync_id text not null,
  confirmed text null,
  destination text null,
  info_provider_id uuid not null,
  constraint cashew_warehouse_transactions_pkey primary key (id),
  constraint cashew_warehouse_transactions_reference_store_id_fkey foreign KEY (reference_store_id) references warehouse_details (id) on delete set null,
  constraint cashew_warehouse_transactions_store_id_fkey foreign KEY (store_id) references warehouse_details (id) on delete set null
) TABLESPACE pg_default;


-- Borders table
create table public.borders (
  id uuid not null default gen_random_uuid (),
  name text not null,
  border_type text not null,
  province_id uuid not null,
  country_id uuid not null,
  description text null,
  sync_id text not null,
  constraint borders_pkey primary key (id),
  constraint borders_country_id_fkey foreign KEY (country_id) references countries (id) on delete CASCADE,
  constraint borders_province_id_fkey foreign KEY (province_id) references provinces (id) on delete CASCADE
) TABLESPACE pg_default;


-- Cashew shipments table
create table public.cashew_shipments (
  id uuid not null default gen_random_uuid (),
  shipment_number text not null,
  owner_id uuid not null,
  owner_type text not null,
  status text not null default 'PENDING'::text,
  sync_id text not null,
  constraint cashew_shipments_pkey primary key (id),
  constraint cashew_shipments_shipment_number_key unique (shipment_number),
  constraint cashew_shipments_owner_type_check check (
    (
      owner_type = any (
        array['FARMER'::text, 'TRADER'::text, 'GROUP'::text]
      )
    )
  ),
  constraint cashew_shipments_status_check check (
    (
      status = any (array['PENDING'::text, 'DELIVERED'::text])
    )
  )
) TABLESPACE pg_default;


-- Checkpoints table
create table public.checkpoints (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  sync_id text not null,
  is_active text not null default 'true'::text,
  checkpoint_type text not null,
  southern_next_checkpoint_id uuid null,
  northern_next_checkpoint_id uuid null,
  eastern_next_checkpoint_id uuid null,
  western_next_checkpoint_id uuid null,
  constraint checkpoints_pkey primary key (id),
  constraint checkpoints_eastern_next_checkpoint_id_fkey foreign KEY (eastern_next_checkpoint_id) references checkpoints (id) on delete set null,
  constraint checkpoints_western_next_checkpoint_id_fkey foreign KEY (western_next_checkpoint_id) references checkpoints (id) on delete set null,
  constraint checkpoints_northern_next_checkpoint_id_fkey foreign KEY (northern_next_checkpoint_id) references checkpoints (id) on delete set null,
  constraint checkpoints_southern_next_checkpoint_id_fkey foreign KEY (southern_next_checkpoint_id) references checkpoints (id) on delete set null,
  constraint checkpoints_is_active_check check (
    (
      is_active = any (array['true'::text, 'false'::text])
    )
  ),
  constraint checkpoints_no_self_reference_check check (
    (
      (id <> southern_next_checkpoint_id)
      and (id <> northern_next_checkpoint_id)
      and (id <> eastern_next_checkpoint_id)
      and (id <> western_next_checkpoint_id)
    )
  ),
  constraint checkpoints_checkpoint_type_check check (
    (
      checkpoint_type = any (
        array[
          'INTERNATIONAL'::text,
          'INTERPROVINCIAL'::text,
          'INTERDISTRITAL'::text,
          'INTRADISTRICTAL'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;


-- Shipment loads table
create table public.shipment_loads (
  id uuid not null default gen_random_uuid (),
  shipment_id uuid not null,
  product_type text not null,
  quantity integer not null,
  unit text not null,
  number_of_bags integer not null,
  weight_per_bag real not null,
  bag_type text not null,
  driver_id uuid not null,
  car_id uuid not null,
  sync_id text not null,
  constraint shipment_loads_pkey primary key (id),
  constraint shipment_loads_driver_id_fkey foreign KEY (driver_id) references actors (id) on delete set null,
  constraint shipment_loads_shipment_id_fkey foreign KEY (shipment_id) references cashew_shipments (id) on delete CASCADE,
  constraint shipment_loads_bag_type_check check (
    (
      bag_type = any (
        array[
          'BOX'::text,
          'RAFFIA'::text,
          'JUTE'::text,
          'JUTE-RAFFIA'::text
        ]
      )
    )
  ),
  constraint shipment_loads_product_type_check check (
    (
      product_type = any (array['CASHEW_KERNEL'::text, 'CASHEW_NUT'::text])
    )
  ),
  constraint shipment_loads_unit_check check (
    (
      unit = any (array['KG'::text, 'TONS'::text, 'BAGS'::text])
    )
  )
) TABLESPACE pg_default;


-- Shipment directions table
create table public.shipment_directions (
  id uuid not null default gen_random_uuid (),
  direction text not null,
  departure_address_id uuid not null,
  destination_address_id uuid not null,
  shipment_id uuid not null,
  sync_id text not null,
  constraint shipment_directions_pkey primary key (id),
  constraint shipment_directions_shipment_id_unique unique (
    shipment_id,
    departure_address_id,
    destination_address_id
  ),
  constraint shipment_directions_shipment_id_fkey foreign KEY (shipment_id) references cashew_shipments (id) on delete CASCADE,
  constraint shipment_directions_direction_check check (
    (
      direction = any (
        array[
          'OUTBOUND'::text,
          'RETURN'::text,
          'REROUTED'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;


-- Shipment checks table
create table public.shipment_checks (
  id uuid not null default gen_random_uuid (),
  shipment_id uuid not null,
  checkpoint_id uuid not null,
  checkpoint_type text not null,
  shipment_direction_id uuid not null,
  checked_by_id uuid not null,
  checked_at timestamp with time zone not null,
  notes text null,
  sync_id text not null,
  constraint shipment_checks_pkey primary key (id),
  constraint shipment_checks_shipment_id_unique unique (shipment_id, checkpoint_id, shipment_direction_id),
  constraint shipment_checks_checkpoint_id_fkey foreign KEY (checkpoint_id) references checkpoints (id) on delete set null,
  constraint shipment_checks_checked_by_id_fkey foreign KEY (checked_by_id) references user_details (id) on delete set null,
  constraint shipment_checks_shipment_direction_id_fkey foreign KEY (shipment_direction_id) references shipment_directions (id) on delete set null,
  constraint shipment_checks_shipment_id_fkey foreign KEY (shipment_id) references cashew_shipments (id) on delete set null,
  constraint shipment_checks_checkpoint_type_check check (
    (
      checkpoint_type = any (
        array[
          'DEPARTURE'::text,
          'AT_ARRIVAL'::text,
          'IN_TRANSIT'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;


-- Shipment checkpoints table
create table public.shipment_checkpoints (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  address_id uuid not null,
  sync_id text not null,
  southern_next_checkpoint_id uuid null,
  northern_next_checkpoint_id uuid null,
  eastern_next_checkpoint_id uuid null,
  western_next_checkpoint_id uuid null,
  is_active boolean not null default true,
  checkpoint_type text null,
  constraint shipment_checkpoints_pkey primary key (id),
  constraint shipment_checkpoints_eastern_next_checkpoint_id_fkey foreign KEY (eastern_next_checkpoint_id) references shipment_checkpoints (id) on delete set null,
  constraint shipment_checkpoints_northern_next_checkpoint_id_fkey foreign KEY (northern_next_checkpoint_id) references shipment_checkpoints (id) on delete set null,
  constraint shipment_checkpoints_southern_next_checkpoint_id_fkey foreign KEY (southern_next_checkpoint_id) references shipment_checkpoints (id) on delete set null,
  constraint shipment_checkpoints_western_next_checkpoint_id_fkey foreign KEY (western_next_checkpoint_id) references shipment_checkpoints (id) on delete set null,
  constraint shipment_checkpoints_check check (
    (
      (id <> southern_next_checkpoint_id)
      and (id <> northern_next_checkpoint_id)
      and (id <> eastern_next_checkpoint_id)
      and (id <> western_next_checkpoint_id)
    )
  ),
  constraint shipment_checkpoints_checkpoint_type_check check (
    (
      checkpoint_type = any (
        array[
          'INTERNATIONAL'::text,
          'INTERPROVINCIAL'::text,
          'INTERDISTRITAL'::text,
          'INTRADISTRICTAL'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;


-- Shipment checkpoint sequence table
create table public.shipment_checkpoint_sequence (
  id uuid not null default gen_random_uuid (),
  shipment_id uuid not null,
  shipment_direction_id uuid not null,
  checkpoint_id uuid not null,
  sequence_order integer not null,
  sync_id text not null,
  created_at timestamp with time zone not null default now(),
  constraint shipment_checkpoint_sequence_pkey primary key (id),
  constraint unique_shipment_checkpoint_sequence unique (
    shipment_id,
    shipment_direction_id,
    checkpoint_id,
    sequence_order
  ),
  constraint shipment_checkpoint_sequence_checkpoint_id_fkey foreign KEY (checkpoint_id) references checkpoints (id) on delete set null,
  constraint shipment_checkpoint_sequence_shipment_direction_id_fkey foreign KEY (shipment_direction_id) references shipment_directions (id) on delete CASCADE,
  constraint shipment_checkpoint_sequence_shipment_id_fkey foreign KEY (shipment_id) references cashew_shipments (id) on delete CASCADE
) TABLESPACE pg_default;


-- Shipment checkpoint inspectors table
create table public.shipment_checkpoint_inspectors (
  id uuid not null default gen_random_uuid (),
  checkpoint_id uuid not null,
  inspector_id uuid not null,
  sync_id uuid not null,
  constraint shipment_checkpoints_inspectors_pkey primary key (id),
  constraint unique_checkpoint_inspector unique (checkpoint_id, inspector_id),
  constraint shipment_checkpoint_inspectors_checkpoint_id_fkey foreign KEY (checkpoint_id) references checkpoints (id) on delete set null,
  constraint shipment_checkpoints_inspectors_inspector_id_fkey foreign KEY (inspector_id) references user_details (id) on delete set null
) TABLESPACE pg_default;


-- Shipment cars table
create table public.shipment_cars (
  id uuid not null default gen_random_uuid (),
  car_type text not null,
  plate_number text not null,
  sync_id text not null,
  constraint shipment_cars_pkey primary key (id)
) TABLESPACE pg_default;

-- Cashew inborders smuggling table
create table public.cashew_inborders_smuggling (
  id uuid not null default gen_random_uuid (),
  shipment_id uuid not null,
  destination_district_id uuid not null,
  departure_district_id uuid not null,
  smuggling_notes text null,
  sync_id text not null,
  constraint cashew_inborders_smuggling_pkey primary key (id),
  constraint cashew_inborders_smuggling_departure_district_id_fkey foreign KEY (departure_district_id) references districts (id) on delete CASCADE,
  constraint cashew_inborders_smuggling_destination_district_id_fkey foreign KEY (destination_district_id) references districts (id) on delete CASCADE,
  constraint cashew_inborders_smuggling_shipment_id_fkey foreign KEY (shipment_id) references cashew_shipments (id) on delete CASCADE
) TABLESPACE pg_default;


-- Cashew crossborders smuggling table
create table public.cashew_crossborders_smuggling (
  id uuid not null default gen_random_uuid (),
  shipment_id uuid not null,
  destination_country_id uuid not null,
  border_name text not null,
  smuggling_notes text null,
  sync_id text not null,
  constraint cashew_crossborders_smuggling_pkey primary key (id),
  constraint cashew_crossborders_smuggling_destination_country_id_fkey foreign KEY (destination_country_id) references countries (id) on delete CASCADE,
  constraint cashew_crossborders_smuggling_shipment_id_fkey foreign KEY (shipment_id) references cashew_shipments (id) on delete CASCADE
) TABLESPACE pg_default;