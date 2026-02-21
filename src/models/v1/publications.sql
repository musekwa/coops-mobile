do $$
begin
    if exists (select 1 from pg_publication where pubname = 'powersync') then
        drop publication powersync;
    end if;
    create publication powersync for table group_managers, group_members, user_details, cashew_warehouse_transactions, organization_transactions, organization_transaction_participants, licenses, nuits, nuels, countries, provinces, districts, admin_posts, villages, cashew_shipments, shipment_checkpoints, shipment_loads, shipment_cars, shipment_directions, shipment_checks, shipment_checkpoint_inspectors, shipment_checkpoint_sequence, cashew_crossborders_smuggling, cashew_inborders_smuggling, borders, actors, birth_dates, birth_places, contact_details, address_details, facilities, warehouse_details, actor_categories, actor_details, genders, worker_assignments, group_manager_assignments, checkpoints; 
end $$;
