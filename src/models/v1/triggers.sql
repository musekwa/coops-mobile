-- Validate group members trigger
create trigger validate_group_member_trigger before insert
or update on group_members for each row
execute function validate_group_member ();

-- Validate license owner trigger
create trigger validate_license_owner_trigger before insert
or update on licenses for each row
execute function validate_license_owner ();

-- Validate info provider trigger
create trigger validate_info_provider_trigger before insert
or
update on organization_transactions for each row
execute function validate_info_provider ();

-- Validate cashew warehouse info provider trigger
create trigger validate_cashew_warehouse_info_provider_trigger before insert
or
update on cashew_warehouse_transactions for each row
execute function validate_info_provider ();

-- Validate shipment owner id trigger
create trigger validate_shipment_owner_id_trigger before insert
or
update on cashew_shipments for each row
execute function validate_owner_id ();