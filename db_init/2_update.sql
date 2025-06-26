USE task_manager;

CREATE TABLE IF NOT EXISTS task_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE KEY unique_task_tag (task_id, tag)
); 