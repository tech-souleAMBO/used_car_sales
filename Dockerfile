FROM composer:2 AS vendor
WORKDIR /app
COPY backend-laravel/composer.json backend-laravel/composer.lock* ./
RUN composer install --no-dev --no-scripts --no-autoloader --ignore-platform-reqs
COPY backend-laravel/ ./
RUN mkdir -p bootstrap/cache && chown -R www-data:www-data storage bootstrap/cache
RUN composer dump-autoload --optimize

FROM php:8.3-apache
RUN apt-get update && apt-get install -y \
    libpq-dev libzip-dev unzip \
    && docker-php-ext-install pdo pdo_pgsql zip \
    && a2enmod rewrite \
    && a2enmod cgid

WORKDIR /var/www/html
COPY --from=vendor /app ./

RUN printf '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    CGIPassAuth on\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>\n' > /etc/apache2/sites-available/000-default.conf

RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80
CMD ["sh", "-c", "php artisan migrate:fresh --force --seed && apache2-foreground"]
