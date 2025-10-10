#!/usr/bin/env bash
# ==============================================================================
# FINAL DEBUG COMMANDO — Fix 502/504
# Objectif : Diagnostiquer la communication INTERNE entre Nginx et l'application.
# C'est la dernière étape avant de conclure à un problème de réseau ou de binding.
# ==============================================================================

set -e

# Couleurs pour la lisibilité
ok() { echo -e "\e[32m✔ $*\e[0m"; }
err() { echo -e "\e[31m✖ $*\e[0m"; }
info() { echo -e "\e[36mℹ $*\e[0m"; }
step() { echo -e "\n\e[1;33m>> ÉTAPE $1: $2\e[0m"; }

# --- PARAMÈTRES (à vérifier par Rocketnew) ---
NGINX_CONTAINER_NAME="nginx"  # Nom du conteneur Nginx (à trouver avec 'docker ps')
APP_HOST="app"                # Nom du service backend tel qu'utilisé dans proxy_pass
APP_PORT="3000"               # Port du service backend

# ==============================================================================

step 1 "Vérification des conteneurs en cours d'exécution"
if ! command -v docker &> /dev/null; then
    err "La commande 'docker' n'a pas été trouvée. Ce script est conçu pour un environnement Docker."
    exit 1
fi
info "Liste des conteneurs actifs :"
docker ps
echo ""

# ==============================================================================

step 2 "Vérification de l'état de l'application backend"
info "Recherche du conteneur de l'application (basé sur le nom '$APP_HOST')..."
APP_CONTAINER_ID=$(docker ps -qf "name=${APP_HOST}")

if [ -z "$APP_CONTAINER_ID" ]; then
    err "CRITIQUE : Aucun conteneur en cours d'exécution correspondant au nom '$APP_HOST' n'a été trouvé."
    info "Pistes : Le conteneur a-t-il crashé ? Le nom du service est-il correct dans docker-compose.yml ?"
    exit 1
else
    ok "Conteneur de l'application trouvé : $APP_CONTAINER_ID"
    info "Affichage des 20 dernières lignes de logs du conteneur '$APP_HOST' :"
    docker logs --tail 20 "$APP_CONTAINER_ID"
    echo ""
fi

# ==============================================================================

step 3 "Test de communication DEPUIS le conteneur Nginx"
info "Recherche du conteneur Nginx (basé sur le nom '$NGINX_CONTAINER_NAME')..."
NGINX_CONTAINER_ID=$(docker ps -qf "name=${NGINX_CONTAINER_NAME}")

if [ -z "$NGINX_CONTAINER_ID" ]; then
    err "CRITIQUE : Aucun conteneur Nginx en cours d'exécution correspondant au nom '$NGINX_CONTAINER_NAME' n'a été trouvé."
    exit 1
else
    ok "Conteneur Nginx trouvé : $NGINX_CONTAINER_ID"
fi

info "Tentative d'installation de 'curl' dans le conteneur Nginx (nécessaire pour le test)..."
# La plupart des images Nginx de base n'ont pas curl. On l'installe temporairement.
docker exec "$NGINX_CONTAINER_ID" sh -c "apt-get update && apt-get install -y curl" || {
    info "Échec de l'installation avec apt-get, tentative avec apk (Alpine)..."
    docker exec "$NGINX_CONTAINER_ID" sh -c "apk update && apk add curl"
} || {
    err "Impossible d'installer curl dans le conteneur Nginx. Le diagnostic ne peut pas continuer."
    exit 1
}

info "Test de la connexion depuis Nginx vers http://${APP_HOST}:${APP_PORT}..."
set +e # On désactive l'arrêt sur erreur pour capturer le résultat
CURL_OUTPUT=$(docker exec "$NGINX_CONTAINER_ID" curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://${APP_HOST}:${APP_PORT}")
CURL_EXIT_CODE=$?
set -e

if [ "$CURL_EXIT_CODE" -eq 0 ] && [[ "$CURL_OUTPUT" == "200" || "$CURL_OUTPUT" == "204" ]]; then
    ok "SUCCÈS : Le conteneur Nginx peut communiquer avec l'application. Le code de statut est $CURL_OUTPUT."
    info "Le problème se situe donc très probablement dans la configuration Nginx (le fichier .conf)."
    info "Vérifiez que 'proxy_pass' est bien 'http://${APP_HOST}:${APP_PORT}' et rechargez Nginx."
else
    err "ÉCHEC CRITIQUE : Le conteneur Nginx NE PEUT PAS communiquer avec l'application."
    info "Code de statut retourné : $CURL_OUTPUT"
    info "Code de sortie de curl : $CURL_EXIT_CODE (0=OK, 6=Cannot resolve host, 7=Failed to connect)"
    echo ""
    info "=========================== DIAGNOSTIC FINAL ==========================="
    if [ "$CURL_EXIT_CODE" -eq 6 ]; then
        err "Cause probable : Problème de réseau Docker. Le conteneur Nginx ne sait pas ce qu'est '${APP_HOST}'. Assurez-vous que les deux conteneurs sont dans le même réseau Docker personnalisé."
    elif [ "$CURL_EXIT_CODE" -eq 7 ]; then
        err "Cause probable : Problème de 'Binding'. L'application '${APP_HOST}' écoute probablement sur '127.0.0.1' au lieu de '0.0.0.0'. Elle refuse la connexion de Nginx."
    else
        err "Cause probable : Inconnue, mais la communication de base est rompue. Vérifiez les firewalls et les configurations réseau."
    fi
    info "========================================================================"
    exit 1
fi

# ==============================================================================

step 4 "Vérification finale du site public"
info "La communication interne semble correcte. Re-vérification du site public..."
PUBLIC_CODE=$(curl -sS -o /dev/null -w "%{http_code}" -I --connect-timeout 5 "https://trading-mvp.com")
if [[ "$PUBLIC_CODE" == "200" || "$PUBLIC_CODE" == "204" ]]; then
    ok "Le site public répond maintenant avec le code $PUBLIC_CODE ! Le problème est probablement résolu."
else
    info "Le site public renvoie toujours $PUBLIC_CODE. La configuration Nginx est la prochaine suspecte."
fi