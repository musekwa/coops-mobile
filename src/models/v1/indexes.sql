-- Address details constraints
create unique INDEX IF not exists unique_address_details_owner_id_owner_type on public.address_details using btree (owner_id, owner_type) TABLESPACE pg_default
where
  (owner_type <> 'CASHEW_SHIPMENT'::text);


create index IF not exists idx_shipment_checkpoint_sequence_shipment_id on public.shipment_checkpoint_sequence using btree (shipment_id) TABLESPACE pg_default;

create index IF not exists idx_shipment_checkpoint_sequence_direction_id on public.shipment_checkpoint_sequence using btree (shipment_direction_id) TABLESPACE pg_default;

create index IF not exists idx_shipment_checkpoint_sequence_order on public.shipment_checkpoint_sequence using btree (
  shipment_id,
  shipment_direction_id,
  sequence_order
) TABLESPACE pg_default;