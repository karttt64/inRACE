/* ============================================================
   KARTLOG PRO - LOGICA DI SISTEMA
   ============================================================ */

   document.addEventListener('DOMContentLoaded', () => {
    inizializzaMenu();
    updateCircuitLink();
});

// 1. POPOLAMENTO AUTOMATICO DEI MENU (DA CONFIG.JS)
function inizializzaMenu() {
    try {
        // Mappatura: ID dell'HTML -> Chiave nell'oggetto CONFIG
        const menuMaps = {
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

        for (const [id, data] of Object.entries(menuMaps)) {
            const select = document.getElementById(id);
            if (select) {
                select.innerHTML = ''; // Pulisce
                data.forEach(item => {
                    const opt = document.createElement('option');
                    opt.value = item;
                    opt.textContent = item;
                    select.appendChild(opt);
                });
            }
        }
    } catch (error) {
        console.error("Errore nel caricamento CONFIG:", error);
    }
}

// 2. GESTIONE LINK PISTA
function updateCircuitLink() {
    const select = document.getElementById('select_circuito');
    const link = document.getElementById('pista_url');
    const circuitoScelto = CONFIG.circuiti.find(c => c.nome === select.value);

    if (circuitoScelto && circuitoScelto.url) {
        link.href = circuitoScelto.url;
        link.style.display = 'inline-block';
    } else {
        link.style.display = 'none';
    }
}

// 3. CALCOLO DELTA PRESSIONI
function calcDelta() {
    const wheels = ['as', 'ad', 'ps', 'pd'];
    wheels.forEach(w => {
        const inVal = parseFloat(document.getElementById(`${w}_in`).value);
        const outVal = parseFloat(document.getElementById(`${w}_out`).value);
        const display = document.getElementById(`d_${w}`);

        if (!isNaN(inVal) && !isNaN(outVal)) {
            const delta = (outVal - inVal).toFixed(2);
            display.innerText = `Δ: ${delta}`;
            display.style.color = delta > 0.15 ? "#d32f2f" : "#2e7d32"; // Rosso se scalda troppo
        } else {
            display.innerText = "Δ: --";
        }
    });
}

// 4. RECUPERO METEO LIVE (SIMULATO/API)
async function loadWeather() {
    const status = document.getElementById('weather-status');
    status.innerText = "⏳ Recupero dati...";

    try {
        // Qui andrebbe la chiamata API reale. Per ora simuliamo i dati.
        setTimeout(() => {
            document.getElementById('temp_aria').value = 22.5;
            document.getElementById('umidita').value = 45;
            document.getElementById('temp_asfalto').value = 32.0;
            document.getElementById('cond_meteo_live').value = "Soleggiato";
            
            const ora = new Date().toLocaleTimeString();
            status.innerHTML = `✅ Aggiornato alle: <b>${ora}</b>`;
        }, 800);
    } catch (error) {
        status.innerText = "❌ Errore meteo";
    }
}

// 5. SALVATAGGIO SESSIONE
let sessioniSalvate = [];

function salvaSessione() {
    const data = {
        timestamp: new Date().toLocaleString(),
        circuito: document.getElementById('select_circuito').value,
        pilota: document.getElementById('driver').value,
        best: document.getElementById('best').value,
        pressioni: {
            ant_sx: `${document.getElementById('as_in').value}/${document.getElementById('as_out').value}`,
            ant_dx: `${document.getElementById('ad_in').value}/${document.getElementById('ad_out').value}`,
            post_sx: `${document.getElementById('ps_in').value}/${document.getElementById('ps_out').value}`,
            post_dx: `${document.getElementById('pd_in').value}/${document.getElementById('pd_out').value}`
        }
    };

    sessioniSalvate.push(data);
    aggiornaLog(data);
}

function aggiornaLog(data) {
    const log = document.getElementById('log');
    const entry = document.createElement('div');
    entry.className = 'summary';
    entry.innerHTML = `
        <b>${data.timestamp}</b> - ${data.circuito}<br>
        🏁 Pilota: ${data.pilota} | Best: ${data.best}<br>
        🛞 Press: ${data.pressioni.ant_sx} | ${data.pressioni.ant_dx} | ${data.pressioni.post_sx} | ${data.pressioni.post_dx}
    `;
    log.prepend(entry);
}

// 6. ESPORTAZIONE CSV (EXCEL)
function esportaCSV() {
    if (sessioniSalvate.length === 0) return alert("Nessun dato da esportare!");

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Data,Circuito,Pilota,Best Lap,Pressioni\n";

    sessioniSalvate.forEach(s => {
        csvContent += `${s.timestamp},${s.circuito},${s.pilota},${s.best},${Object.values(s.pressioni).join('|')}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KartLog_Export_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
}