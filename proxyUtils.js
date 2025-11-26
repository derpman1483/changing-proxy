import { pinggy } from "@pinggy/pinggy";
const URLs = [];
export async function getUrls(port = 5000, times = 2) {
    let existingUrls = URLs.find(item => item.port === port);
    if (!existingUrls) {
        existingUrls = await newUrl(port, times);
    }
    return existingUrls.urls;
}
export async function newUrl(port = 5000, times = 2) {
    if (times < 1) {
        times = 1;
    }
    const obj = { "urls": [], "port": port, "tunnels": [] };

    for (let i = 0; i < times; i++) {
        try {
            const tunnel = pinggy.createTunnel({ forwarding: `localhost:${port}`,"headerModification": [
    { "action": "update", "key": "X-Frame-Options", "value":"ALLOWALL"},
    { "action": "remove", "key": "Content-Security-Policy" },
    { "action": "add", "key": "Access-Control-Allow-Origin", "value": "*" },
    { "action": "add", "key": "Access-Control-Allow-Methods", "value": "*" },
    { "action": "add", "key": "Access-Control-Allow-Headers", "value": "*" },
    { "action": "add", "key": "Access-Control-Allow-Credentials", "value": "true" }
  ] });
            await tunnel.start();
            const tunnelUrls = await tunnel.urls();
            if (tunnelUrls && tunnelUrls.length > 0) {
                obj.urls.push(tunnelUrls.length > 1 ? tunnelUrls[1] : tunnelUrls[0]);
                obj.tunnels.push(tunnel);
            }
        } catch (error) {
            console.error(`Error while creating tunnel for port ${port}:`, error);
        }
    }

    URLs.push(obj);
    const objectIndex = URLs.length - 1;

    setTimeout(async () => {
        const indexToRemove = URLs.findIndex(item => item === obj);
        if (indexToRemove > -1) {
            const removedItem = URLs.splice(indexToRemove, 1)[0];
            for (const tunnel of removedItem.tunnels) {
                try {
                    await tunnel.stop();
                } catch (error) {
                    console.error(`Error while stopping tunnel:`, error);
                }
            }
            console.log(`Stopped ${removedItem.urls.length} URLs for port: ${removedItem.port}`);
        } else {
            console.log(`Could not stop tunnels for port ${port}, as they were not found.`);
        }
    }, 3600 * 1000);

    console.log(`Timer started for object at index ${objectIndex}`);
    return obj;
}
export async function unsafeNewUrl(port = 5000, times = 2) {
    if (times < 1) {
        times = 1;
    }
    const obj = { "urls": [], "port": port, "tunnels": [] };

    for (let i = 0; i < times; i++) {
        try {
            const tunnel = pinggy.createTunnel({ forwarding: `localhost:${port}`,"headerModification": [
    { "action": "update", "key": "X-Frame-Options", "value":"ALLOWALL"},
    { "action": "remove", "key": "Content-Security-Policy" },
    { "action": "add", "key": "Access-Control-Allow-Origin", "value": "*" },
    { "action": "add", "key": "Access-Control-Allow-Methods", "value": "*" },
    { "action": "add", "key": "Access-Control-Allow-Headers", "value": "*" },
    { "action": "add", "key": "Access-Control-Allow-Credentials", "value": "true" }
  ] });
            await tunnel.start();
            const tunnelUrls = await tunnel.urls();

            if (tunnelUrls && tunnelUrls.length > 0) {
                obj.urls.push(tunnelUrls.length > 1 ? tunnelUrls[1] : tunnelUrls[0]);
                obj.tunnels.push(tunnel);
            }
        } catch (error) {
            console.error(`Error while creating unsafe tunnel for port ${port}:`, error);
        }
    }
    return obj;
}