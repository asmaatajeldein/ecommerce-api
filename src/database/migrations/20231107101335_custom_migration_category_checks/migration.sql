-- This is a custom migration.

-- Cycle node check
ALTER TABLE category 
ADD CONSTRAINT single_cycle_node_check
CHECK (parent_id <> id);