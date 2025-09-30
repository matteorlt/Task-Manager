-- Ajoute le champ de couleur pour les tâches
ALTER TABLE tasks
  ADD COLUMN color VARCHAR(7) NULL AFTER category;
