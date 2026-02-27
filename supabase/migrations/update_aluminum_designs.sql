-- Replace old generic aluminium designs with new FLA figures
-- Wood designs remain unchanged

-- Step 1: Remove old aluminium designs that are NOT referenced by quote_requests
DELETE FROM designs 
WHERE material = 'aluminum' 
  AND id NOT IN (SELECT DISTINCT design_id FROM quote_requests WHERE design_id IS NOT NULL);

-- Step 2: Insert the new FLA aluminium designs
INSERT INTO designs (name, material, description, base_price, sort_order) VALUES
  ('FLA-2', 'aluminum', 'Rahmen aus stranggepresstem Aluminium-Hohlkammerprofil 71/32 mm, Lamellen aus stranggepresstem Alu-Hohlkammerprofil 38/10 mm, mit Verstärkungssteg.', 189, 1),
  ('FLA-2B', 'aluminum', 'Rahmen aus stranggepresstem Aluminium-Hohlkammerprofil 71/32 mm, Lamellen aus stranggepresstem Alu-Hohlkammerprofil 50/10 mm, mit zwei Verstärkungsstegen.', 199, 2),
  ('FLA-2B/8', 'aluminum', 'Figurkombination Füllung aus Aluminiumplatte 2,5 mm, Lamellen 50/10 mm, Aufteilung der Felder nach Wunsch. Es kann auch die Lamelle 38/10 mm kombiniert werden.', 209, 3),
  ('FLA-2B Beweglich', 'aluminum', 'Rahmen aus stranggepresstem Aluminium-Hohlkammerprofil 71/32 mm, Lamellen aus stranggepresstem Alu-Hohlkammerprofil 50/10 mm, Lamellen mit Schwenkhebel stufenlos verstellbar, direkt im Rahmen gelagert.', 219, 4),
  ('FLA-4', 'aluminum', 'Rahmen aus stranggepresstem Aluminium-Hohlkammerprofil 71/32 mm, schräge, feststehende, dem Rahmen vorstehende Lamellen aus stranggepresstem Alu-Hohlkammerprofil 98/13 mm.', 229, 5),
  ('FLA-5 Beweglich', 'aluminum', 'Rahmen aus stranggepresstem Aluminium-Hohlkammerprofil 71/32 mm, bewegliche Lamellen aus stranggepresstem Alu-Hohlkammerprofil 98/13 mm, im Rahmen gelagert, Lamellenverstellung mit Zugstange, Lamellenfeststeller zur Arretierung.', 239, 6),
  ('FLA-6', 'aluminum', 'Rahmen aus stranggepresstem Aluminium-Hohlkammerprofil 71/32 mm, Waagrechte stranggepresste Lamellen 100/15 mm mit Verstärkungssteg, Lamellen werden mit Klips-Profilleiste im Rahmen gehalten.', 249, 7),
  ('FLA-8', 'aluminum', 'Rahmen aus stranggepresstem Aluminium-Hohlkammerprofil 71/32 mm, Füllung aus Aluminiumplatte 2,5 mm, mit Profilleiste in Rahmen geklipst.', 259, 8),
  ('FLA-GP', 'aluminum', 'Rahmen aus stranggepresstem Aluminium-Hohlkammerprofil 71/32 mm, aufgenietete Aluminiumplatte 2,5 mm, glatte Platte ohne Lochungen.', 269, 9),
  ('FLA-LP', 'aluminum', 'Rahmen aus stranggepresstem Aluminium-Hohlkammerprofil 71/32 mm, aufgenietetes Aluminium-Lochblech 2,5 mm mit Standardlochungen, verschiedene Lochmuster möglich.', 279, 10);
