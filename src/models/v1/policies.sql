-- -- Create RLS policies for the tables


-- Create RLS policy for the countries table
alter table public.countries 
    disable row level security; 


-- Create RLS policy for the provinces table
alter table public.provinces 
    disable row level security; 

-- Create RLS policy for the districts table
alter table public.districts 
    disable row level security; 

-- Create RLS policy for the admin_posts table
alter table public.admin_posts 
    disable row level security; 

-- Create RLS policy for the villages table
alter table public.villages 
    disable row level security; 


-- Create RLS policy for the user_details table
alter table public.user_details 
    disable row level security; 

-- Create RLS policy for the actors table
alter table public.actors 
    disable row level security; 

-- Create RLS policy for the actor_details table
alter table public.actor_details 
    disable row level security; 

-- Create RLS policy for the actor_categories table
alter table public.actor_categories 
    disable row level security; 

    -- Create RLS policy for the address_details table
alter table public.address_details 
    disable row level security; 



-- Create RLS policy for the birth_dates table
alter table public.birth_dates 
    disable row level security; 


-- Create RLS policy for the birth_places table
alter table public.birth_places 
    disable row level security; 
    
-- Create RLS policy for the genders table
alter table public.genders 
    disable row level security; 


-- Create RLS policy for the contact_details table
alter table public.contact_details 
    disable row level security; 

-- Create RLS policy for the facilities table
alter table public.facilities 
    disable row level security; 

-- Create RLS policy for the group_members table
alter table public.group_members 
    disable row level security; 

-- Create RLS policy for the group_managers table
alter table public.group_managers 
    disable row level security; 

-- Create RLS policy for the group_manager_assignments table
alter table public.group_manager_assignments 
    disable row level security; 

-- Create RLS policy for the identification_documents table
alter table public.identification_documents 
    disable row level security; 

-- Create RLS policy for the licenses table
alter table public.licenses 
    disable row level security; 

-- Create RLS policy for the nuels table
alter table public.nuels 
    disable row level security; 


-- Create RLS policy for the nuits table
alter table public.nuits 
    disable row level security; 


-- Create RLS policy for the organization_transaction_participants table
alter table public.organization_transaction_participants 
    disable row level security; 

-- Create RLS policy for the organization_transactions table
alter table public.organization_transactions 
    disable row level security; 

-- Create RLS policy for the worker_assignments table
alter table public.worker_assignments 
    disable row level security; 


-- Create RLS policy for the cashew_warehouse_transactions table
alter table public.cashew_warehouse_transactions 
    disable row level security; 


-- Create RLS policy for the warehouse_details table
alter table public.warehouse_details 
    disable row level security; 

-- Create RLS policy for the borders table
alter table public.borders 
    disable row level security; 

-- Create RLS policy for the cashew_shipments table
alter table public.cashew_shipments 
    disable row level security; 


-- Create RLS policy for the checkpoints table
alter table public.checkpoints 
    disable row level security; 

-- Create RLS policy for the shipment_loads table
alter table public.shipment_loads 
    disable row level security; 

-- Create RLS policy for the shipment_directions table
alter table public.shipment_directions 
    disable row level security; 


-- Create RLS policy for the shipment_checks table
alter table public.shipment_checks 
    disable row level security; 


-- Create RLS policy for the shipment_checkpoints table
alter table public.shipment_checkpoints 
    disable row level security; 

-- Create RLS policy for the shipment_checkpoint_sequence table
alter table public.shipment_checkpoint_sequence 
    disable row level security; 

-- Create RLS policy for the shipment_checkpoint_inspectors table
alter table public.shipment_checkpoint_inspectors 
    disable row level security; 


-- Create RLS policy for the shipment_cars table
alter table public.shipment_cars 
    disable row level security; 


-- Create RLS policy for the cashew_inborders_smuggling table
alter table public.cashew_inborders_smuggling 
    disable row level security; 

-- Create RLS policy for the cashew_crossborders_smuggling table
alter table public.cashew_crossborders_smuggling 
    disable row level security; 