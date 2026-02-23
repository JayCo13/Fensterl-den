-- Replace existing designs with Figur naming convention
-- First delete existing designs, then insert new Figur designs

-- Delete existing aluminum designs
DELETE FROM designs WHERE material = 'aluminum';

-- Delete existing wood designs  
DELETE FROM designs WHERE material = 'wood';

-- Insert Aluminum Figur Designs
INSERT INTO designs (name, material, description, base_price, sort_order) VALUES
  ('Figur 1', 'aluminum', 'Klassisches Lamellendesign mit horizontalen Lamellen', 189, 1),
  ('Figur 2', 'aluminum', 'Elegantes Design mit breiteren Lamellen', 199, 2),
  ('Figur 2B', 'aluminum', 'Variante von Figur 2 mit verstärkten Rahmen', 209, 3),
  ('Figur 3', 'aluminum', 'Modernes Design mit schmalen Lamellen', 219, 4),
  ('Figur 4', 'aluminum', 'Traditionelles Design mit mittelbreiten Lamellen', 229, 5),
  ('Figur 5', 'aluminum', 'Stilvolles Design mit abgewinkelten Lamellen', 239, 6),
  ('Figur 6', 'aluminum', 'Zeitgenössisches Design mit Lichtschlitzen', 249, 7),
  ('Figur 7', 'aluminum', 'Vollflächiges Design ohne Lamellen - kein Aussteller/Kombination möglich', 199, 8),
  ('Figur 7G', 'aluminum', 'Figur 7 mit Glasausschnitt - kein Aussteller/Kombination möglich', 259, 9),
  ('Figur 8', 'aluminum', 'Premium-Design mit feinen Lamellen', 269, 10),
  ('Figur 9', 'aluminum', 'Exklusives Design mit Zierleisten', 279, 11),
  ('Silq', 'aluminum', 'Minimalistisches Silq-Design', 299, 12),
  ('Silq AR', 'aluminum', 'Silq mit abgerundeten Kanten', 319, 13);

-- Insert Wood Figur Designs
INSERT INTO designs (name, material, description, base_price, sort_order) VALUES
  ('Figur 1', 'wood', 'Klassisches Lamellendesign mit horizontalen Lamellen', 249, 1),
  ('Figur 2', 'wood', 'Elegantes Design mit breiteren Lamellen', 269, 2),
  ('Figur 2B', 'wood', 'Variante von Figur 2 mit verstärkten Rahmen', 279, 3),
  ('Figur 3', 'wood', 'Modernes Design mit schmalen Lamellen', 289, 4),
  ('Figur 4', 'wood', 'Traditionelles Design mit mittelbreiten Lamellen', 299, 5),
  ('Figur 5', 'wood', 'Stilvolles Design mit abgewinkelten Lamellen', 309, 6),
  ('Figur 6', 'wood', 'Zeitgenössisches Design mit Lichtschlitzen', 319, 7),
  ('Figur 7', 'wood', 'Vollflächiges Design ohne Lamellen - kein Aussteller/Kombination möglich', 269, 8),
  ('Figur 7G', 'wood', 'Figur 7 mit Glasausschnitt - kein Aussteller/Kombination möglich', 329, 9),
  ('Figur 8', 'wood', 'Premium-Design mit feinen Lamellen', 349, 10),
  ('Figur 9', 'wood', 'Exklusives Design mit Zierleisten', 369, 11),
  ('Silq', 'wood', 'Minimalistisches Silq-Design', 389, 12),
  ('Silq AR', 'wood', 'Silq mit abgerundeten Kanten', 409, 13);
