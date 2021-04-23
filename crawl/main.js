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
    let events = new Map();
    nodes('/node/feed/9/parent/group+event?limit=200')['node']
        //.forEach(x => { events[x.name] = x.id; });
        .forEach(x => events.set(x.id, x.name));
    return events;
}

function renderEvent(head, es) {
    let li = [];
    let dnf = [];
    li.push(`<h1>${head}</h1>`);
    li.push('<ul id="table">');
    for (const x in es) {
        if (es[x] === null) {
            dnf.push(`<li class='dnf'><b>${x}</b> did not finish</li>`);
            continue;
        }
        li.push(`<li><b>${x}</b> made <a href='https://ldjam.com${es[x].path}'>${es[x].name}</a></li>`);
    }
    li = li.concat(dnf);
    li.push('</ul>');
    return li.join('\n');
}

function main() {
    const events = crawlEvents();
    const keys = Array.from(events.keys()).sort((a, b) => b - a);

    console.log('loading list...');

    const list_file = std.open('./lists/pixel-prophecy.txt', 'r');
    const list = list_file.readAsString().split('\n').filter(x => x.length > 0);
    list_file.close();

    console.log('preparing map...');

    let games = new Map();
    for (const k of keys) {
        games.set(k, {});
        let curr = games.get(k);
        for (const auth of list) {
            curr[auth] = null;
        }
    }

    console.log('filling map with games...');

    for (const author of list) {
        const entries = crawlGames(author);
        for (const [k, v] of entries) {
            games.get(k)[author] = v;
        }
    }

    const id = 32802;
    console.log(renderEvent(events.get(id), games.get(id)));
}

main();
