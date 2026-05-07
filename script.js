document.addEventListener('DOMContentLoaded', () => {
    inizializzaApp();
});

function inizializzaApp() {
    if (typeof CONFIG === 'undefined') {
        console.error("Config non trovato!");
        return;
    }

    const mapping = {
        'select_circuito': CONFIG.circuiti.map(c => c.nome),
        'driver': CONFIG.piloti,
        'sessione': CONFIG.sessioni,
        'cond_pista': CONFIG.condizioni,
        'gommatura': CONFIG.gommatura,
        'pos': CONFIG.posizioni,
        'camber': CONFIG.setup.camber,
        'caster': CONFIG.setup.caster,
        'convergenza': CONFIG.setup.convergenza,
        'altezza_ant': CONFIG.setup.altezze,
        'altezza_post': CONFIG.setup.altezze,
        'rapporto': CONFIG.setup.rapporti
    };

    for (const [id, data] of Object.entries(mapping)) {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = data.map(val => `<option value="${val}">${val}</option>`).join('');
        }
    }
    updateCircuitLink();
}

function updateCircuitLink() {
    const val = document.getElementById('select_circuito').value;
    const link = document.getElementById('pista_url');
    const circ = CONFIG.circuiti.find(c => c.nome === val);
    if (circ) { link.href = circ.url; link.style.display = 'block'; }
}

function calcDelta() {
    ['as', 'ad', 'ps', 'pd'].forEach(id => {
        const i = parseFloat(document.getElementById(id+'_in').value);
        const o = parseFloat(document.getElementById(id+'_out').value);
        const d = document.getElementById('d_'+id);
        if (!isNaN(i) && !isNaN(o)) {
            const res = (o - i).toFixed(2);
            d.innerText = `Δ: ${res}`;
            d.style.color = res > 0.15 ? "var(--primary)" : "var(--success)";
        }
    });
}

async function loadWeather() {
    const status = document.getElementById('weather-status');
    status.innerText = "Recupero...";
    setTimeout(() => {
        document.getElementById('temp_aria').value = "22°";
        document.getElementById('umidita').value = "45%";
        document.getElementById('temp_asfalto').value = "31°";
        document.getElementById('cond_meteo_live').value = "Sole";
        status.innerText = "Aggiornato: " + new Date().toLocaleTimeString();
    }, 600);
}

let logs = [];
function salvaSessione() {
    const data = {
        t: new Date().toLocaleTimeString(),
        c: document.getElementById('select_circuito').value,
        p: document.getElementById('driver').value,
        s: document.getElementById('sessione').value,
        b: document.getElementById('best').value,
        pos: document.getElementById('pos').value,
        // Meteo
        tempA: document.getElementById('temp_aria').value,
        tempAsf: document.getElementById('temp_asfalto').value,
        cond: document.getElementById('cond_pista').value,
        // Setup
        rapporto: document.getElementById('rapporto').value,
        spillo: document.getElementById('spillo').value,
        // Pressioni
        press: {
            as: `${document.getElementById('as_in').value}/${document.getElementById('as_out').value}`,
            ad: `${document.getElementById('ad_in').value}/${document.getElementById('ad_out').value}`,
            ps: `${document.getElementById('ps_in').value}/${document.getElementById('ps_out').value}`,
            pd: `${document.getElementById('pd_in').value}/${document.getElementById('pd_out').value}`
        }
    };

    logs.push(data);
    function aggiornaLogVisivo(data) {
        const div = document.createElement('div');
        div.className = 'summary';
        div.innerHTML = `
            <div style="border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 8px;">
                <b style="color: var(--primary);">${data.t}</b> | <b>${data.c}</b>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 0.8rem;">
                <div>👤 <b>Pilota:</b> ${data.p} (${data.s})</div>
                <div>⏱️ <b>Best:</b> ${data.b} | <b>Pos:</b> ${data.pos}</div>
                <div>🌡️ <b>Meteo:</b> ${data.tempA}°A / ${data.tempAsf}°Asf</div>
                <div>🛣️ <b>Pista:</b> ${data.cond}</div>
                <div>🔧 <b>Setup:</b> ${data.rapporto} | Spillo: ${data.spillo}</div>
                <div>🛞 <b>Press:</b> ${data.press.as} - ${data.press.ad} | ${data.press.ps} - ${data.press.pd}</div>
            </div>
        `;
        document.getElementById('log').prepend(div);
    }
}

function esportaCSV() {
    let csv = "Ora,Circuito,Best\n" + logs.map(l => `${l.t},${l.c},${l.b}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'KartLog.csv';
    a.click();
}