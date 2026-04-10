FROM postgres:16

# Install Japanese locale required for DB creation (LC_COLLATE/LC_CTYPE = ja_JP.UTF-8)
RUN apt-get update \
    && apt-get install -y --no-install-recommends locales \
    && sed -i '/^# ja_JP.UTF-8/s/^# //' /etc/locale.gen \
    && locale-gen \
    && update-locale LC_ALL=ja_JP.UTF-8 \
    && rm -rf /var/lib/apt/lists/*

ENV LANG=ja_JP.UTF-8
ENV LC_ALL=ja_JP.UTF-8

# Bake in the init script so it has correct execute permissions at runtime
COPY init.sh /docker-entrypoint-initdb.d/init.sh
RUN chmod +x /docker-entrypoint-initdb.d/init.sh
