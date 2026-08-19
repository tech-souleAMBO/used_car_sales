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
    && a2enmod rewrite

WORKDIR /var/www/html
COPY --from=vendor /app ./

RUN sed -i 's#DocumentRoot /var/www/html#DocumentRoot /var/www/html/public#' /etc/apache2/sites-available/000-default.conf \
    && sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80
CMD ["sh", "-c", "php artisan migrate --force && apache2-foreground"]
