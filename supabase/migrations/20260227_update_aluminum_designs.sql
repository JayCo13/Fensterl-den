-- Update existing aluminum designs to FLA series

DELETE FROM designs WHERE material = 'aluminum';

INSERT INTO designs (name, material, description, base_price, sort_order) VALUES
  ('FLA2', 'aluminum', 'Rahmen aus stranggepresstem AluminiumHohlkammerprofil 71/32 mm, Lamellen aus stranggepresstem Alu-Hohlkammerprofil 38/10 mm, mit Verstärkungssteg.', 199, 1),
  ('FLA2B', 'aluminum', 'Rahmen aus stranggepresstem AluminiumHohlkammerprofil 71/32 mm, Lamellen aus stranggepresstem Alu-Hohlkammerprofil 50/10 mm, mit zwei Verstärkungsstegen.', 219, 2),
  ('FLA2B-8', 'aluminum', 'Figurkombination Füllung aus Aluminiumplatte 2,5 mm, Lamellen 50/10 mm, Aufteilung der Felder nach Wunsch. Es kann auch die Lamelle 38/10 mm kombiniert werden.', 249, 3),
  ('FLA2B beweglich', 'aluminum', 'Rahmen aus stranggepresstem AluminiumHohlkammerprofil 71/32 mm, Lamellen aus stranggepresstem Alu-Hohlkammerprofil 50/10 mm, Lamellen mit Schwenkhebel stufenlos verstellbar, direkt im Rahmen gelagert', 289, 4),
  ('FLA4', 'aluminum', 'Rahmen aus stranggepresstem AluminiumHohlkammerprofil 71/32 mm, schräge, feststehende, dem Rahmen vorstehende Lamellen aus stranggepresstem Alu-Hohlkammerprofil 98/13 mm.', 239, 5),
  ('FLA5 beweglich', 'aluminum', 'Rahmen aus stranggepresstem AluminiumHohlkammerprofil 71/32 mm, bewegliche Lamellen aus stranggepresstem Alu-Hohlkammerprofil 98/13 mm, im Rahmen gelagert, Lamellenverstellung mit Zugstange, Lamellenfeststeller zur Arretierung.', 299, 6),
  ('FLA6', 'aluminum', 'Rahmen aus stranggepresstem AluminiumHohlkammerprofil 71/32 mm, Waagrechte stranggepresste Lamellen 100/15 mm mit Verstärkungssteg, Lamellen werden mit Klips-Profilleiste im Rahmen gehalten, obere Lamelle wird angepasst, Lamellen auch senkrecht möglich.', 259, 7),
  ('FLA8', 'aluminum', 'Rahmen aus stranggepresstem AluminiumHohlkammerprofil 71/32 mm, Füllung aus Aluminiumplatte 2,5 mm, mit Profilleiste in Rahmen geklipst.', 269, 8),
  ('FLA-GP', 'aluminum', 'Rahmen aus stranggepresstem Aluminium-Hohlkammerprofil 71/32 mm, aufgenietete Aluminiumplatte 2,5 mm, glatte Platte ohne Lochungen.', 289, 9),
  ('FLA-LP', 'aluminum', 'Rahmen aus stranggepresstem Aluminium-Hohlkammerprofil 71/32 mm, aufgenietetes Aluminium-Lochblech 2,5 mm mit Standardlochungen, verschiedene Lochmuster möglich.', 299, 10);
