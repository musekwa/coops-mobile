CREATE TABLE IF NOT EXISTS public.cashew_inborders_smuggling (
    id uuid not null default gen_random_uuid(),
    shipment_id uuid not null,
    destination_district_id uuid not null,
    departure_district_id uuid not null,
    smuggling_notes text,
    sync_id text not null,
    constraint cashew_inborders_smuggling_pkey primary key (id),
    constraint cashew_inborders_smuggling_shipment_id_fkey foreign key (shipment_id) references cashew_shipments(id) on delete cascade,
    constraint cashew_inborders_smuggling_destination_district_id_fkey foreign key (destination_district_id) references districts(id) on delete cascade,
    constraint cashew_inborders_smuggling_departure_district_id_fkey foreign key (departure_district_id) references districts(id) on delete cascade
) tablespace pg_default;

CREATE TABLE IF NOT EXISTS public.cashew_crossborders_smuggling (
    id uuid not null default gen_random_uuid(),
    shipment_id uuid not null,
    destination_country_id uuid not null,
    border_name text not null,
    smuggling_notes text,
    sync_id text not null,
    constraint cashew_crossborders_smuggling_pkey primary key (id),
    constraint cashew_crossborders_smuggling_shipment_id_fkey foreign key (shipment_id) references cashew_shipments(id) on delete cascade,
    constraint cashew_crossborders_smuggling_destination_country_id_fkey foreign key (destination_country_id) references countries(id) on delete cascade
) tablespace pg_default;

CREATE TABLE IF NOT EXISTS public.borders (
    id uuid not null default gen_random_uuid(),
    name text not null,
    border_type text not null,
    province_id uuid not null,
    country_id uuid not null,
    description text,
    sync_id text not null,
    constraint borders_pkey primary key (id),
    constraint borders_province_id_fkey foreign key (province_id) references provinces(id) on delete cascade,
    constraint borders_country_id_fkey foreign key (country_id) references countries(id) on delete cascade
) tablespace pg_default;