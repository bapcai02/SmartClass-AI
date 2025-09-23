FROM php:8.3-fpm

# Install system deps
RUN apt-get update && apt-get install -y \
    git curl zip unzip supervisor \
    libpng-dev libonig-dev libzip-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip \
    && rm -rf /var/lib/apt/lists/*

# Install PHP Redis extension
RUN pecl install redis \
    && docker-php-ext-enable redis

# Install Node.js (LTS) and npm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update && apt-get install -y nodejs \
    && npm -v && node -v

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Configure Supervisor directory
RUN mkdir -p /etc/supervisor/conf.d /var/log/supervisor

WORKDIR /var/www/html

# Default command: run php-fpm and supervisor
CMD service supervisor start && php-fpm

