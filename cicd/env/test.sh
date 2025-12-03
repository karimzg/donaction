#!/bin/bash
echo "VARIABLES......"
#for var in $(env | cut -d= -f1); do
for var in $(env | grep '_PLACEHOLDER' | cut -d= -f1); do
  # Remplacer les variables dans le fichier d'environnement
  echo "${var}"
#  echo "${!var}"
done
