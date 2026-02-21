

-- Create a role/user with replication privileges for PowerSync
create role powersync_role with replication bypassrls login password 'powersync_role';
-- Set up permissions for the newly created role
-- Read-only (SELECT) access is required
grant select on all tables in schema public to powersync_role;  

-- Optionally, grant SELECT on all future tables (to cater for schema additions)
alter default privileges in schema public grant select on tables to powersync_role;