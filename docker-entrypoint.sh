#!/bin/bash

echo "Migrating db"
yarn run prisma migrate deploy

echo "Starting bot"
yarn start:docker
