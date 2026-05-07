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
    const s = {
        t: new Date().toLocaleTimeString(),
        c: document.getElementById('select_circuito').value,
        b: document.getElementById('best').value
    };
    logs.push(s);
    const div = document.createElement('div');
    div.className = 'summary';
    div.innerHTML = `<b>${s.t}</b> - ${s.c} - Best: ${s.b}`;
    document.getElementById('log').prepend(div);
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