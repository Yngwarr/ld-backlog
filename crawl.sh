#!/bin/bash

set -x

function crawl {
    curl -s "https://api.ldjam.com/vx$1" \
        -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0' \
        -H 'Accept: */*' \
        -H 'Accept-Language: en-US,en;q=0.5' --compressed \
        -H 'Referer: https://ldjam.com/' \
        -H 'Origin: https://ldjam.com' \
        -H 'Connection: keep-alive' -H 'TE: Trailers'
}

function nodes {
    NODES=$(crawl "$1" | jq '.feed[] | .id' | paste -sd '+')
    crawl "/node2/get/$NODES"
}

ID=$(crawl '/node2/walk/1/users/preda' | jq '.node_id')
# 250 is the limit forced by ldjam API :(
GAMES=$(nodes "/node/feed/$ID/authors/item/game?limit=250" | jq '.node[] | { parent, name, path }')

LDS=$(nodes "/node/feed/9/parent/group+event?limit=200" | jq '.node[] | { id, name }')
