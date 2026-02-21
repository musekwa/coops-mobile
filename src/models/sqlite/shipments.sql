

-- Create table for Cashew Shipments
create table if not exists
    public.cashew_shipments (
        id uuid not null default gen_random_uuid(),
        shipment_number text not null unique, -- shipment identifier
        owner_id uuid not null,
        owner_type text not null check (owner_type in ('FARMER', 'TRADER', 'GROUP')),
        status text not null default 'PENDING' check (status in ('PENDING', 'DELIVERED')),
        sync_id text not null,
        constraint cashew_shipments_pkey primary key (id)
    ) tablespace pg_default;

-- Create table for Shipment Checkpoints
create table if not exists
    public.shipment_checkpoints (
        id uuid not null default gen_random_uuid(),
        checkpoint_name text not null,
        description text,
        address_id uuid not null,
        southern_next_checkpoint_id uuid,
        northern_next_checkpoint_id uuid,
        eastern_next_checkpoint_id uuid,
        western_next_checkpoint_id uuid,
        sync_id text not null,
        constraint shipment_checkpoints_pkey primary key (id),
        -- constraint shipment_checkpoints_address_id_fkey foreign key (address_id) references addresses(id) on delete set null, -- DEPRECATED: addresses table removed, needs migration to address_details
        constraint shipment_checkpoints_southern_next_checkpoint_id_fkey foreign key (southern_next_checkpoint_id) references shipment_checkpoints(id) on delete set null,
        constraint shipment_checkpoints_northern_next_checkpoint_id_fkey foreign key (northern_next_checkpoint_id) references shipment_checkpoints(id) on delete set null,
        constraint shipment_checkpoints_eastern_next_checkpoint_id_fkey foreign key (eastern_next_checkpoint_id) references shipment_checkpoints(id) on delete set null
        constraint shipment_checkpoints_western_next_checkpoint_id_fkey foreign key (western_next_checkpoint_id) references shipment_checkpoints(id) on delete set null
    ) tablespace pg_default;


-- Create table for Shipment Drivers
create table if not exists
    public.shipment_drivers (
        id uuid not null default gen_random_uuid(),
        driver_name text not null,
        driver_phone text not null,
        sync_id text not null,
        constraint shipment_drivers_pkey primary key (id)
    ) tablespace pg_default;

-- Create table for Shipment Cars
create table if not exists
    public.shipment_cars (
        id uuid not null default gen_random_uuid(),
        car_type text not null,
        plate_number text not null,
        sync_id text not null,
        constraint shipment_cars_pkey primary key (id),
    ) tablespace pg_default;

-- Create table for Shipment Loads
create table if not exists
    public.shipment_loads (
        id uuid not null default gen_random_uuid(),
        shipment_id uuid not null,
        product_type text not null check (product_type in ('CASHEW_KERNEL', 'CASHEW_NUT')),
        quantity integer not null,
        unit text not null check (unit in ('KG', 'TONS', 'BAGS')),
        number_of_bags integer not null,
        weight_per_bag real not null,
        bag_type text not null check (bag_type in ('BOX', 'RAFFIA', 'JUTE', 'JUTE-RAFFIA')),
        driver_id uuid not null,
        car_id uuid not null,
        sync_id text not null,
        constraint shipment_loads_pkey primary key (id),
        constraint shipment_loads_shipment_id_fkey foreign key (shipment_id) references cashew_shipments(id) on delete cascade,
        constraint shipment_loads_driver_id_fkey foreign key (driver_id) references actors(id) on delete set null
    ) tablespace pg_default;



create table if not exists public.checkpoints (
    id uuid not null default gen_random_uuid(),
    name text not null,
    description text,
    sync_id text not null,
    southern_next_checkpoint_id uuid,
    northern_next_checkpoint_id uuid,
    eastern_next_checkpoint_id uuid,
    western_next_checkpoint_id uuid,
    is_active text not null default 'true' check (is_active in ('true', 'false')),
    checkpoint_type text not null check (checkpoint_type in ('INTERNATIONAL', 'INTERPROVINCIAL', 'INTERDISTRITAL', 'INTRADISTRICTAL')),
    constraint checkpoints_pkey primary key (id),
    constraint checkpoints_southern_next_checkpoint_id_fkey foreign key (southern_next_checkpoint_id) references checkpoints(id) on delete set null,
    constraint checkpoints_northern_next_checkpoint_id_fkey foreign key (northern_next_checkpoint_id) references checkpoints(id) on delete set null,
    constraint checkpoints_eastern_next_checkpoint_id_fkey foreign key (eastern_next_checkpoint_id) references checkpoints(id) on delete set null,
    constraint checkpoints_western_next_checkpoint_id_fkey foreign key (western_next_checkpoint_id) references checkpoints(id) on delete set null,
    CHECK (
        id != southern_next_checkpoint_id AND
        id != northern_next_checkpoint_id AND
        id != eastern_next_checkpoint_id AND
        id != western_next_checkpoint_id
    )
) TABLESPACE pg_default;






create table if not exists public.shipment_checkpoint_inspectors (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    checkpoint_id uuid NOT NULL,
    inspector_id uuid NOT NULL,
    sync_id uuid NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (checkpoint_id) REFERENCES checkpoints(id) ON DELETE SET NULL,
    FOREIGN KEY (inspector_id) REFERENCES user_details(id) ON DELETE SET NULL,
    CONSTRAINT unique_checkpoint_inspector UNIQUE (checkpoint_id, inspector_id)
) TABLESPACE pg_default;



-- Create table for Shipment Directions
create table if not exists
    public.shipment_directions (
        id uuid not null default gen_random_uuid(),
        direction text not null check (direction in ('OUTBOUND', 'RETURN', 'REROUTED')),
        departure_address_id uuid not null,
        destination_address_id uuid not null,
        shipment_id uuid not null,
        sync_id text not null,
        constraint shipment_directions_pkey primary key (id),
        constraint shipment_directions_shipment_id_fkey foreign key (shipment_id) references cashew_shipments(id) on delete cascade,
        constraint shipment_directions_shipment_id_unique unique (shipment_id, departure_address_id, destination_address_id)
    ) tablespace pg_default;


-- Create table for Shipment Checks
create table if not exists
    public.shipment_checks (
        id uuid not null default gen_random_uuid(),
        shipment_id uuid not null,
        checkpoint_id uuid not null,
        checkpoint_type text not null check (checkpoint_type in ('DEPARTURE', 'AT_ARRIVAL', 'IN_TRANSIT')),
        shipment_direction_id uuid not null
        checked_by_id uuid not null,
        checked_at timestamp with time zone not null,
        notes text,
        sync_id text not null,
        constraint shipment_checks_pkey primary key (id),
        constraint shipment_checks_shipment_id_fkey foreign key (shipment_id) references cashew_shipments(id) on delete set null,
        constraint shipment_checks_checkpoint_id_fkey foreign key (checkpoint_id) references checkpoints(id) on delete set null,
        constraint shipment_checks_shipment_direction_id_fkey foreign key (shipment_direction_id) references shipment_directions(id) on delete set null,
        constraint shipment_checks_checked_by_id_fkey foreign key (checked_by_id) references user_details(id) on delete set null,
        constraint shipment_checks_shipment_id_unique unique (shipment_id, checkpoint_id, shipment_direction_id)
    ) tablespace pg_default;


