#!/bin/sh
# Script de démarrage du backend Laravel (conteneur Render).
#
# Objectif : ne JAMAIS plus bloquer le démarrage d'Apache si la base de
# données est indisponible (sinon Render crash-loop et le site entier
# devient inaccessible). Chaque échec de migrate/seed est imprimé en entier
# dans les logs Render avec le préfixe [boot][ERROR] pour être facile à
# retrouver dans la recherche de logs.

set -u

log_error() {
    echo "[boot][ERROR] $1"
}

echo "[boot] starting backend"

attempt=1
while [ "$attempt" -le 3 ]; do
    echo "[boot] migrate attempt $attempt/3"
    migrate_out=$(php artisan migrate --force 2>&1)
    migrate_status=$?
    echo "$migrate_out"

    if [ "$migrate_status" -eq 0 ]; then
        echo "[boot] migrate OK"
        seed_out=$(php artisan db:seed --force 2>&1)
        seed_status=$?
        echo "$seed_out"
        if [ "$seed_status" -eq 0 ]; then
            echo "[boot] seed OK"
        else
            log_error "seed failed (attempt $attempt/3)"
        fi
        break
    fi

    log_error "migrate failed (attempt $attempt/3) - see output above"
    attempt=$((attempt + 1))
    sleep 10
done

echo "[boot] starting Apache"
exec apache2-foreground
