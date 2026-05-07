/* ============================================================
   KARTLOG PRO - LOGICA DI SISTEMA COMPLETA
   ============================================================ */

   document.addEventListener('DOMContentLoaded', () => {
    inizializzaApp();
});

// 1. INIZIALIZZAZIONE: Popolamento menu da config.js
function inizializzaApp() {
    if (typeof CONFIG === 'undefined') {
        console.error("File config.js non trovato o non caricato correttamente.");
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
    
    // Imposta il link iniziale della pista
    updateCircuitLink();
}

// 2. AGGIORNAMENTO LINK SITO PISTA
function updateCircuitLink() {
    const select = document.getElementById('select_circuito');
    const link = document.getElementById('pista_url');
    if (!select || !link) return;

    const circ = CONFIG.circuiti.find(c => c.nome === select.value);
    if (circ && circ.url) {
        link.href = circ.url;
        link.style.display = 'inline-block';
    } else {
        link.style.display = 'none';
    }
}

// 3. CALCOLO DELTA PRESSIONI (In tempo reale)
function calcDelta() {
    const wheels = ['as', 'ad', 'ps', 'pd'];
    wheels.forEach(id => {
        const inEl = document.getElementById(`${id}_in`);
        const outEl = document.getElementById(`${id}_out`);
        const deltaDisplay = document.getElementById(`d_${id}`);
        
        if (inEl && outEl && deltaDisplay) {
            const valIn = parseFloat(inEl.value);
            const valOut = parseFloat(outEl.value);
            
            if (!isNaN(valIn) && !isNaN(valOut)) {
                const res = (valOut - valIn).toFixed(2);
                deltaDisplay.innerText = `Δ: ${res}`;
                // Colore dinamico: verde se entro 0.15, rosso se eccessivo
                deltaDisplay.style.color = res > 0.15 ? "var(--primary)" : "var(--success)";
            } else {
                deltaDisplay.innerText = "Δ: --";
                deltaDisplay.style.color = "var(--text-muted)";
            }
        }
    });
}

// 4. RECUPERO METEO LIVE (Simulazione)
async function loadWeather() {
    const status = document.getElementById('weather-status');
    status.innerText = "⏳ Recupero dati in corso...";

    // Simuliamo una chiamata API
    setTimeout(() => {
        document.getElementById('temp_aria').value = "21.5";
        document.getElementById('umidita').value = "48";
        document.getElementById('temp_asfalto').value = "30.0";
        document.getElementById('cond_meteo_live').value = "Soleggiato";
        
        const ora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        status.innerHTML = `✅ Aggiornato alle: <b>${ora}</b>`;
    }, 800);
}

// 5. SALVATAGGIO SESSIONE E LOG DETTAGLIATO
let logsSalvati = [];

function salvaSessione() {
    // Raccolta dati completa
    const data = {
        ora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        circuito: document.getElementById('select_circuito').value,
        pilota: document.getElementById('driver').value,
        sessione: document.getElementById('sessione').value,
        best: document.getElementById('best').value || "N/A",
        pos: document.getElementById('pos').value,
        aria: document.getElementById('temp_aria').value || "--",
        asf: document.getElementById('temp_asfalto').value || "--",
        pista: document.getElementById('cond_pista').value,
        rapporto: document.getElementById('rapporto').value,
        spillo: document.getElementById('spillo').value || "--",
        press: {
            as: `${document.getElementById('as_in').value || '?'}/${document.getElementById('as_out').value || '?'}`,
            ad: `${document.getElementById('ad_in').value || '?'}/${document.getElementById('ad_out').value || '?'}`,
            ps: `${document.getElementById('ps_in').value || '?'}/${document.getElementById('ps_out').value || '?'}`,
            pd: `${document.getElementById('pd_in').value || '?'}/${document.getElementById('pd_out').value || '?'}`
        }
    };

    logsSalvati.push(data);
    mostraAnteprimaLog(data);
}

function mostraAnteprimaLog(data) {
    const logContainer = document.getElementById('log');
    const entry = document.createElement('div');
    entry.className = 'summary';
    
    // Generazione HTML dell'anteprima dettagliata (Foto 2)
    entry.innerHTML = `
        <div style="border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between;">
            <span><b>${data.ora}</b> - ${data.circuito}</span>
            <b style="color: var(--primary);">BEST: ${data.best}</b>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem;">
            <div>👤 <b>Pilota:</b> ${data.pilota} (${data.sessione})</div>
            <div>🏆 <b>Posizione:</b> ${data.pos}</div>
            <div>🌡️ <b>Meteo:</b> ${data.aria}°C Aria / ${data.asf}°C Asfalto</div>
            <div>🛣️ <b>Pista:</b> ${data.pista}</div>
            <div>🔧 <b>Setup:</b> Rapporto ${data.rapporto} | Spillo: ${data.spillo}</div>
            <div>🛞 <b>Pressioni (In/Out):</b><br>
                 ANT: ${data.press.as} | ${data.press.ad}<br>
                 POST: ${data.press.ps} | ${data.press.pd}
            </div>
        </div>
    `;
    
    // Inserisce il nuovo log in cima alla lista
    logContainer.prepend(entry);
}

// 6. ESPORTAZIONE CSV (EXCEL)
function esportaCSV() {
    if (logsSalvati.length === 0) {
        alert("Nessuna sessione salvata da esportare!");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Ora,Circuito,Pilota,Sessione,Best Lap,Pos,Temp Aria,Temp Asfalto,Pista,Rapporto,Pressioni\n";

    logsSalvati.forEach(l => {
        const row = [
            l.ora,
            l.circuito,
            l.pilota,
            l.sessione,
            l.best,
            l.pos,
            l.aria,
            l.asf,
            l.pista,
            l.rapporto,
            `${l.press.as}|${l.press.ad}|${l.press.ps}|${l.press.pd}`
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KartLog_Export_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}