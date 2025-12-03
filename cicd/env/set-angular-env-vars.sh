#!/bin/sh

# Vérifier si un argument est passé
if [ -z "$1" ]; then
  echo "Usage: $0 <environment>"
  exit 1
fi

ENV_FILE="klubr-admin/src/environments/environment.$1.ts"

ENV_MAJ=$(echo "$1" | tr '[:lower:]' '[:upper:]')
echo "ENV_MAJ: $ENV_MAJ"

# Vérifier si le fichier d'environnement existe
if [ ! -f "$ENV_FILE" ]; then
  echo "Le fichier $ENV_FILE n'existe pas."
  exit 1
fi

# Parcourir toutes les variables d'environnement
for var in $(env | grep "$ENV_MAJ" | cut -d= -f1); do
  # Remplacer les variables dans le fichier d'environnement
  value=$(printenv "$var")
  echo $var
  echo $value
  sed -i "s|${var}_PLACEHOLDER|$value|g" "$ENV_FILE"
done
echo "*********************** $ENV_FILE ***********************"
cat "$ENV_FILE"
