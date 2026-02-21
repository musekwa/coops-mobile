CREATE TABLE IF NOT EXISTS public.borders (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    border_type text NOT NULL CHECK (border_type IN ('OFFICIAL', 'INFORMAL')),
    province_id uuid NOT NULL,
    country_id uuid NOT NULL,
    description text,
    sync_id text NOT NULL,
    CONSTRAINT borders_pkey PRIMARY KEY (id),
    CONSTRAINT borders_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id) ON DELETE CASCADE,
    CONSTRAINT borders_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id) ON DELETE CASCADE
) tablespace pg_default;

-- Tanzania
WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Tanzânia' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Cabo Delgado' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Negomano',
    'OFFICIAL',
    province.id,
    country.id,
    'Principal posto - Um dos principais postos da fronteira norte',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Negomano' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Tanzânia' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Cabo Delgado' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Namoto',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto com maior fluxo - Regista mais de 1.500 travessias',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Namoto' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Tanzânia' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Cabo Delgado' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Kilambo/Palma',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto fronteiriço',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Kilambo/Palma' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Tanzânia' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Cabo Delgado' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Unity Bridge/Rovuma',
    'OFFICIAL',
    province.id,
    country.id,
    'Ponte/Posto fronteiriço - Sobre o Rio Rovuma',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Unity Bridge/Rovuma' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Tanzânia' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Cabo Delgado' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Namatil',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto fronteiriço',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Namatil' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Tanzânia' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Cabo Delgado' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Ngapa',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto fronteiriço',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Ngapa' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Tanzânia' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Cabo Delgado' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Nangade-Sede',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto fronteiriço',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Nangade-Sede' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Tanzânia' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Cabo Delgado' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Mocímboa da Praia',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto marítimo/aéreo - Porto e aeroporto',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Mocímboa da Praia' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Tanzânia' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Cabo Delgado' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Travessias em zonas remotas de Cabo Delgado',
    'INFORMAL',
    province.id,
    country.id,
    'Rotas tradicionais - Usadas por comunidades transfronteiriças',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Travessias em zonas remotas de Cabo Delgado' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Tanzânia' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Cabo Delgado' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Caminhos rurais entre aldeias',
    'INFORMAL',
    province.id,
    country.id,
    'Passagens informais - Comércio informal e movimentação local',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Caminhos rurais entre aldeias' AND b.province_id = province.id AND b.country_id = country.id
);

-- Malawi
WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Maláui' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Niassa' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Mandimba',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto de Paragem Única (OSBP) - Um dos 4 postos de paragem única planeados',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Mandimba' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Maláui' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Niassa' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Entre Lagos/Cobué',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto fronteiriço - Acesso ao Lago Niassa',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Entre Lagos/Cobué' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Maláui' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Niassa' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'II Congresso',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto fronteiriço',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'II Congresso' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Maláui' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Tete' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Zobué',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto de Paragem Única (OSBP) - Posto fronteiriço modernizado',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Zobué' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Maláui' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Tete' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Calómuè',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto de Paragem Única (OSBP) - Posto fronteiriço modernizado',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Calómuè' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Maláui' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Tete' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Vila Nova da Fronteira/Dedza',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto fronteiriço',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Vila Nova da Fronteira/Dedza' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Maláui' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Zambézia' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Milange',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto de Paragem Única (OSBP) - Posto fronteiriço modernizado',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Milange' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Maláui' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Zambézia' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Melosa',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto fronteiriço',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Melosa' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Maláui' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Niassa' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Travessias fluviais tradicionais',
    'INFORMAL',
    province.id,
    country.id,
    'Rotas fluviais - Usadas por pescadores e comerciantes locais',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Travessias fluviais tradicionais' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Maláui' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Niassa' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Caminhos rurais entre aldeias fronteiriças',
    'INFORMAL',
    province.id,
    country.id,
    'Passagens informais - Movimento de populações locais',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Caminhos rurais entre aldeias fronteiriças' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Maláui' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Tete' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Rotas de comércio informal',
    'INFORMAL',
    province.id,
    country.id,
    'Caminhos tradicionais - Especialmente em zonas agrícolas',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Rotas de comércio informal' AND b.province_id = province.id AND b.country_id = country.id
);

-- Zambia
WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Zâmbia' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Tete' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Cassacatiza',
    'OFFICIAL',
    province.id,
    country.id,
    'Principal posto - Paragem Única (OSBP) - Acordo para estabelecimento de Posto Fronteiriço de Paragem Única',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Cassacatiza' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Zâmbia' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Tete' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Zumbo',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto fronteiriço - Zona de confluência Zambeze-Luangwa',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Zumbo' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Zâmbia' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Tete' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Travessias fluviais no Rio Zambeze',
    'INFORMAL',
    province.id,
    country.id,
    'Passagens de barco - Usadas por comunidades pesqueiras',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Travessias fluviais no Rio Zambeze' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Zâmbia' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Tete' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Rotas informais em áreas remotas de Tete',
    'INFORMAL',
    province.id,
    country.id,
    'Caminhos rurais - Acesso limitado e áreas isoladas',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Rotas informais em áreas remotas de Tete' AND b.province_id = province.id AND b.country_id = country.id
);

-- Zimbabwe
WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Zimbábue' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Manica' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Machipanda',
    'OFFICIAL',
    province.id,
    country.id,
    'Principal posto - Corredor da Beira - Em processo de modernização com parceria público-privada',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Machipanda' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Zimbábue' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Manica' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Espungabera',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto fronteiriço - Zona de comunidades Ndau transfronteiriças',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Espungabera' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Zimbábue' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Tete' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Nyamapanda/Cuchamano',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto fronteiriço',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Nyamapanda/Cuchamano' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Zimbábue' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Manica' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Travessias tradicionais no distrito de Mossurize',
    'INFORMAL',
    province.id,
    country.id,
    'Rotas comunitárias - Distrito isolado com acessibilidades incipientes, organização tradicional preponderante',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Travessias tradicionais no distrito de Mossurize' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Zimbábue' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Manica' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Caminhos históricos entre comunidades Ndau',
    'INFORMAL',
    province.id,
    country.id,
    'Passagens tradicionais - Locais: Chiurairue, Dacata, Espungabera - Usadas por populações locais com laços familiares',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Caminhos históricos entre comunidades Ndau' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Zimbábue' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Manica' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Rotas de comércio informal',
    'INFORMAL',
    province.id,
    country.id,
    'Caminhos entre aldeias - Comércio de produtos agrícolas e bens',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Rotas de comércio informal' AND b.province_id = province.id AND b.country_id = country.id
);

-- Eswatini
WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Essuatíni' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Maputo' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Namaacha/Lomahasha',
    'OFFICIAL',
    province.id,
    country.id,
    'Principal posto - Uma das fronteiras mais movimentadas',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Namaacha/Lomahasha' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Essuatíni' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Maputo' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Goba',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto fronteiriço',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Goba' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Essuatíni' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Maputo' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Mhlumeni',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto fronteiriço 24h - Único posto aberto 24 horas entre Moçambique e Essuatíni',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Mhlumeni' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Essuatíni' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Maputo' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Passagens informais em zonas agrícolas',
    'INFORMAL',
    province.id,
    country.id,
    'Rotas rurais - Usadas por agricultores e trabalhadores',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Passagens informais em zonas agrícolas' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'Essuatíni' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Maputo' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Caminhos tradicionais entre comunidades locais',
    'INFORMAL',
    province.id,
    country.id,
    'Passagens comunitárias - Movimento diário de populações fronteiriças',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Caminhos tradicionais entre comunidades locais' AND b.province_id = province.id AND b.country_id = country.id
);

-- South Africa
WITH country AS (
    SELECT id FROM public.countries WHERE name = 'África do Sul' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Maputo' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Ressano Garcia/Lebombo',
    'OFFICIAL',
    province.id,
    country.id,
    'Principal fronteira terrestre - Principal fronteira terrestre entre Moçambique e África do Sul',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Ressano Garcia/Lebombo' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'África do Sul' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Maputo' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Namaacha',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto fronteiriço - Também liga com Suazilândia (fronteira tripartida)',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Namaacha' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'África do Sul' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Maputo' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Ponta de Ouro/Kosi Bay',
    'OFFICIAL',
    province.id,
    country.id,
    'Posto fronteiriço - Zona costeira turística',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Ponta de Ouro/Kosi Bay' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'África do Sul' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Maputo' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Múltiplas aberturas informais no arame farpado',
    'INFORMAL',
    province.id,
    country.id,
    'Entradas ilegais - Facilitadas por passadores interligados com operações de transporte, comunicações e transações financeiras',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Múltiplas aberturas informais no arame farpado' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'África do Sul' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Maputo' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Travessias ilegais perto de Ressano Garcia',
    'INFORMAL',
    province.id,
    country.id,
    'Passagens curtas - Usadas por trabalhadores informais e migrantes',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Travessias ilegais perto de Ressano Garcia' AND b.province_id = province.id AND b.country_id = country.id
);

WITH country AS (
    SELECT id FROM public.countries WHERE name = 'África do Sul' LIMIT 1
), province AS (
    SELECT id FROM public.provinces WHERE name = 'Gaza' LIMIT 1
)
INSERT INTO public.borders (id, name, border_type, province_id, country_id, description, sync_id)
SELECT
    gen_random_uuid(),
    'Zonas rurais entre postos oficiais',
    'INFORMAL',
    province.id,
    country.id,
    'Rotas informais - Ao longo da extensa fronteira',
    gen_random_uuid()::text
FROM country, province
WHERE NOT EXISTS (
    SELECT 1 FROM public.borders b WHERE b.name = 'Zonas rurais entre postos oficiais' AND b.province_id = province.id AND b.country_id = country.id
);
