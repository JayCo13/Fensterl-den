-- 1. Rename "Fichte" → "Fichte/Tanne" and update description
UPDATE wood_types
SET name = 'Fichte/Tanne',
    description = 'Fichte und Tanne sind heimische, helle Nadelhölzer mit ruhiger, gleichmäßiger Maserung. Das leichte Material lässt sich sehr gut verarbeiten und eignet sich besonders für klassische, deckend lackierte Fensterläden. Durch ihr geringes Gewicht sind Fichte und Tanne ideal für größere Elemente und sorgen für eine harmonische, zeitlose Optik.'
WHERE name = 'Fichte';

-- 2. Remove "oder geölter" from Lärche description
-- Using REPLACE to safely remove the exact phrase wherever it appears
UPDATE wood_types
SET description = REPLACE(description, ' oder geölter', '')
WHERE name = 'Lärche';

-- Also handle variant with different spacing/casing
UPDATE wood_types
SET description = REPLACE(description, 'oder geölter ', '')
WHERE name = 'Lärche';

-- 3. Remove FLA-2B/8 aluminum design
-- First check if it's referenced in any quote_requests
DELETE FROM designs
WHERE name = 'FLA-2B/8' AND material = 'aluminum'
  AND id NOT IN (SELECT DISTINCT design_id FROM quote_requests WHERE design_id IS NOT NULL);

-- If FLA-2B/8 IS referenced (has existing quotes), just hide it by prefixing [ARCHIV]
-- This is a safety fallback - if the DELETE above didn't remove it, it means it's referenced
UPDATE designs
SET name = '[ARCHIV] FLA-2B/8', sort_order = 999
WHERE name = 'FLA-2B/8' AND material = 'aluminum';
