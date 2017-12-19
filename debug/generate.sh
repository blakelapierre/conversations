#!/bin/bash

mkdir -p secrets/debug-localhost

openssl req -new -newkey rsa:4096 -days 99999 -nodes -x509 \
    -subj "/C=/ST=/L=/O=/CN=localhost" \
    -keyout secrets/debug-localhost/key \
    -out secrets/debug-localhost/cert