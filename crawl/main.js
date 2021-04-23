import * as std from "std";
import { fetch } from "minnet.so";

function log(obj) {
    console.log(JSON.stringify(obj, null, 2));
}

function logMap(map) {
    for (let [key, value] of map) {
        console.log(`${key}: ${JSON.stringify(value)}`);
    }
}

function crawl(path) {
    return fetch(`https://api.ldjam.com/vx${path}`).json();
}

function nodes(path) {
    const ns = crawl(path)['feed'].map(x => x['id']).join('+');
    return crawl(`/node2/get/${ns}`);
}

function crawlGames(author) {
    let games = new Map();
    const id = crawl(`/node2/walk/1/users/${author}`)['node_id'];
    nodes(`/node/feed/${id}/authors/item/game?limit=250`)['node']
        .forEach(x => { games.set(x.parent, { name: x.name, path: x.path }); });
    return games;
}

function crawlEvents() {
    let events = {};
    nodes('/node/feed/9/parent/group+event?limit=200')['node']
        .forEach(x => { events[x.name] = x.id; });
    return events;
}

function main() {
    const events = crawlEvents();
    const keys = Object.keys(events).sort((a, b) => a < b ? 1 : b < a ? -1 : 0);
    //for (let k of keys) {
        //console.log(`${k}: ${events[k]}`);
    //}

    const list_file = std.open('./lists/pixel-prophecy.txt', 'r');
    const list = list_file.readAsString().split('\n');
    list_file.close();

    let games = new Map();
    for (const k of keys) {
        games.set(k, {});
        let curr = games.get(k);
        for (const auth of list) {
            curr[auth] = null;
        }
    }
    logMap(games);

    //const games = crawlGames('philstrahl');
    //logMap(games);
}

main();
