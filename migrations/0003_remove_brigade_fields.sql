-- Mettre à NULL les colonnes effectifs et chef_brigade (dépréciation au lieu de suppression)
-- Cela évite les problèmes de contraintes de clés étrangères

UPDATE brigades SET effectifs = NULL, chef_brigade = NULL;
