#!/bin/sh
sed "s|PROJECT_ROOT|$(pwd)|" base.nginx.conf > nginx.conf
nginx -c $(pwd)/nginx.conf