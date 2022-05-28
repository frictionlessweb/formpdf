#!/bin/sh
DIGITALOCEAN_TOKEN=""
pulumi config set digitalocean:token "$DIGITALOCEAN_TOKEN" --secret
