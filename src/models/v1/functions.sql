
-- Create a trigger to validate actor_id based on category
create or replace function validate_actor_id()
returns trigger as $$
begin
    if new.category = 'FARMER' then
        if not exists (select 1 from farmers where id = new.actor_id) then
            raise exception 'Invalid farmer actor_id';
        end if;
    elsif new.category = 'TRADER' then
        if not exists (select 1 from traders where id = new.actor_id) then
            raise exception 'Invalid trader actor_id';
        end if;
    elsif new.category = 'GROUP' then
        if not exists (select 1 from groups where id = new.actor_id) then
            raise exception 'Invalid group actor_id';
        end if;
    end if;
    return new;
end;
$$ language plpgsql;




-- Create a trigger to validate member_id based on member_type
create or replace function validate_workplace_type()
returns trigger as $$
begin
    if new.workplace_type = 'FARM' then
        -- Check if member_id exists in farmers table
        if not exists (select 1 from farmers where id = new.employer_id) then
            raise exception 'Invalid farmer employer_id';
        end if;
    elsif new.workplace_type = 'WAREHOUSE' then
        -- Check if member_id exists in groups table
        if not exists (select 1 from traders where id = new.employer_id) then
            raise exception 'Invalid trader employer_id';
        end if;
    end if;
    return new;
end;
$$ language plpgsql;



-- Create a trigger to validate cashew shipment owner_id based on owner_type
create or replace function validate_owner_id()
returns trigger as $$
begin
    if new.owner_type = 'FARMER' then
        if not exists (select 1 from farmers where id = new.owner_id) then
            raise exception 'Invalid farmer owner_id';
        end if;
    elsif new.owner_type = 'GROUP' then
        if not exists (select 1 from groups where id = new.owner_id) then
            raise exception 'Invalid group owner_id';
        end if;
    elsif new.owner_type = 'TRADER' then
        if not exists (select 1 from traders where id = new.owner_id) then
            raise exception 'Invalid trader owner_id';
        end if;
    end if;
    return new;
end;
$$ language plpgsql;



-- Create a trigger to validate birth_place_id based on place_type
create or replace function validate_birth_place_id()
returns trigger as $$
begin
    if new.place_type = 'VILLAGE' then
        if not exists (select 1 from villages where id = new.place_id) then
            raise exception 'Invalid village place_id';
        end if;
    elsif new.place_type = 'ADMIN_POST' then
        if not exists (select 1 from admin_posts where id = new.place_id) then
            raise exception 'Invalid admin post place_id';
        end if;
    elsif new.place_type = 'DISTRICT' then
        if not exists (select 1 from districts where id = new.place_id) then
            raise exception 'Invalid district place_id';
        end if;
    elsif new.place_type = 'PROVINCE' then
        if not exists (select 1 from provinces where id = new.place_id) then
            raise exception 'Invalid province place_id';
        end if;
    elsif new.place_type = 'COUNTRY' then
        if not exists (select 1 from countries where id = new.place_id) then
            raise exception 'Invalid country place_id';
        end if;
    end if;
    return new;
end;
$$ language plpgsql;


 -- Create a trigger to validate actor_id based on category
drop function validate_actor_category()
 returns trigger as $$
 begin
     if new.category = 'FARMER' then
         if not exists (select 1 from farmer_details where id = new.id) then
             raise exception 'Invalid FARMER id for actors.id';
         end if;
     elsif new.category = 'TRADER' then
         if not exists (select 1 from traders where id = new.id) then
             raise exception 'Invalid TRADER id for actors.id';
         end if;
     elsif new.category = 'GROUP' then
         if not exists (select 1 from group_details where id = new.id) then
             raise exception 'Invalid GROUP id for actors.id';
         end if;
     elsif new.category = 'EMPLOYEE' then
         if not exists (select 1 from worker_details where id = new.id) then
             raise exception 'Invalid EMPLOYEE id for actors.id';
         end if;
     elsif new.category = 'GROUP_MANAGER' then
         if not exists (select 1 from group_manager_details where id = new.id) then
             raise exception 'Invalid GROUP_MANAGER id for actors.id';
         end if;
     end if;
     return new;
 end;
$$ language plpgsql;


-- Update the validate_group_member() function to use normalized tables
create or replace function validate_group_member()
returns trigger as $$
begin
    -- Validate group_id exists in actors table with category = 'GROUP'
    if not exists (select 1 from actors where id = new.group_id and category = 'GROUP') then
        raise exception 'Invalid group_id: Group does not exist in actors table';
    end if;
    
    -- Validate member_id based on member_type
    if new.member_type = 'FARMER' then
        -- Check if member_id exists in actor_details for FARMER
        if not exists (
            select 1 from actor_details 
            where actor_id = new.member_id 
            and actor_id in (select id from actors where category = 'FARMER')
        ) then
            raise exception 'Invalid farmer member_id: Farmer with id % does not exist in actors table', new.member_id;
        end if;
    elsif new.member_type = 'GROUP' then
        -- Check if member_id exists in actors table with category = 'GROUP'
        if not exists (select 1 from actors where id = new.member_id and category = 'GROUP') then
            raise exception 'Invalid group member_id: Group with id % does not exist in actors table with category = GROUP', NEW.member_id;
        end if;
    end if;
    return new;
end;
$$ language plpgsql;


-- Update the validate_info_provider() function
create or replace function validate_info_provider()
returns trigger as $$
begin
    -- Check if info_provider_id exists in either worker_assignments (for employees) or group_manager_assignments (for group managers)
    if not exists (select 1 from worker_assignments where worker_id = new.info_provider_id and is_active = 'true'
        union
        select 1 from group_manager_assignments where group_manager_id = new.info_provider_id and is_active = 'true'
    ) then
        raise exception 'Invalid info_provider_id: Must be either an active worker (employee) or active group manager';
    end if;
    return new;
end;
$$ language plpgsql;


-- Create a function to validate license owner_id based on owner_type
create or replace function validate_license_owner()
returns trigger as $$
begin
    -- Validate based on owner_type
    if new.owner_type in ('FARMER', 'TRADER', 'GROUP') then
        -- For FARMER, TRADER, and GROUP, owner_id must exist in actors table
        if not exists (select 1 from actors where id = new.owner_id) then
            raise exception 'Invalid owner_id: % does not exist in actors table for owner_type %', new.owner_id, new.owner_type;
        end if;
        
        -- Additional validation: For GROUP, ensure the actor has category = 'GROUP'
        if new.owner_type = 'GROUP' then
            if not exists (select 1 from actors where id = new.owner_id and category = 'GROUP') then
                raise exception 'Invalid owner_id: % is not a GROUP (category must be GROUP)', new.owner_id;
            end if;
        end if;
        
    elsif new.owner_type = 'CASHEW_SHIPMENT' then
        -- For CASHEW_SHIPMENT, owner_id must exist in cashew_shipments table
        if not exists (select 1 from cashew_shipments where id = new.owner_id) then
            raise exception 'Invalid owner_id: % does not exist in cashew_shipments table for owner_type CASHEW_SHIPMENT', new.owner_id;
        end if;
    else
        -- Unknown owner_type (should be caught by check constraint, but adding safety check)
        raise exception 'Invalid owner_type: %', new.owner_type;
    end if;
    return new;
end;
$$ language plpgsql;


