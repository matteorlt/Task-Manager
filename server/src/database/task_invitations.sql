USE task_manager;

-- Ajouter le champ task_id à la table invitations pour supporter les invitations aux tâches
ALTER TABLE invitations ADD COLUMN task_id INT NULL;

-- Ajouter une contrainte de clé étrangère pour task_id
ALTER TABLE invitations ADD CONSTRAINT fk_invitations_task_id FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

-- Ajouter un index pour améliorer les performances
CREATE INDEX idx_invitations_task_id ON invitations(task_id);

-- Ajouter une contrainte pour s'assurer qu'une invitation est soit pour un événement soit pour une tâche
ALTER TABLE invitations ADD CONSTRAINT chk_invitations_event_or_task CHECK (
    (event_id IS NOT NULL AND task_id IS NULL) OR 
    (event_id IS NULL AND task_id IS NOT NULL)
);
