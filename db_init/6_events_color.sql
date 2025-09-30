-- Ajoute le champ de couleur pour les événements
ALTER TABLE events
  ADD COLUMN color VARCHAR(7) NULL AFTER location;


