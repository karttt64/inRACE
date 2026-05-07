let databaseSessioni = JSON.parse(localStorage.getItem('kartLogDB')) || {};

function inizializzaApp() {
    if (typeof CONFIG === 'undefined') {
        alert("Errore: config.js non caricato!");
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
        'rapporto': CONFIG.setup.rapporti,
        'pos_spillo': CONFIG.setup.pos_spillo,
        'candela': CONFIG.setup.candela
    };
    for (const [id, data] of Object.entries(mapping)) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = data.map(v => `<option value="${v}">${v}</option>`).join('');
    }
    updateCircuitLink();
    Object.keys(databaseSessioni).forEach(pilota => aggiungiTabFiltro(pilota));
}

document.addEventListener('DOMContentLoaded', inizializzaApp);

function updateCircuitLink() {
    const v = document.getElementById('select_circuito').value;
    const l = document.getElementById('pista_url');
    const c = CONFIG.circuiti.find(i => i.nome === v);
    if (c) { l.href = c.url; l.style.display = 'block'; }
}

function salvaSessione() {
    const p = document.getElementById('driver').value;
    const d = {
        id: Date.now(),
        data: new Date().toLocaleDateString(),
        ora: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
        circ: document.getElementById('select_circuito').value,
        pilota: p,
        sess: document.getElementById('sessione').value,
        best: document.getElementById('best').value || "--",
        pos: document.getElementById('pos').value,
        meteo: `${document.getElementById('temp_aria').value || '--'}°A / ${document.getElementById('temp_asfalto').value || '--'}°Asf`,
        pista: document.getElementById('cond_pista').value,
        setupM: `Rapp: ${document.getElementById('rapporto').value} | Spillo: ${document.getElementById('spillo').value || '--'} | Getto: ${document.getElementById('getto_max').value || '--'}`,
        setupT: `Cb: ${document.getElementById('camber').value} | Cs: ${document.getElementById('caster').value} | Cv: ${document.getElementById('convergenza').value} | H: ${document.getElementById('altezza_ant').value}/${document.getElementById('altezza_post').value}`,
        press: `ANT: ${document.getElementById('as_in').value}/${document.getElementById('as_out').value} - ${document.getElementById('ad_in').value}/${document.getElementById('ad_out').value} | POST: ${document.getElementById('ps_in').value}/${document.getElementById('ps_out').value} - ${document.getElementById('pd_in').value}/${document.getElementById('pd_out').value}`
    };
    if (!databaseSessioni[p]) { databaseSessioni[p] = []; aggiungiTabFiltro(p); }
    databaseSessioni[p].push(d);
    localStorage.setItem('kartLogDB', JSON.stringify(databaseSessioni));
    mostraLogFiltrato(p);
}

function mostraLogFiltrato(nome) {
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-f-' + nome)?.classList.add('active');
    const container = document.getElementById('log');
    container.innerHTML = `<h3 style="color:var(--primary); font-size:0.8rem; margin-top:20px;">📂 Cartella: ${nome}</h3>`;
    databaseSessioni[nome].slice().reverse().forEach(s => {
        const div = document.createElement('div');
        div.className = 'summary';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding-bottom:5px; margin-bottom:8px;">
                <span><b>${s.data} ${s.ora}</b> - ${s.circ}</span>
                <div style="display:flex; gap:10px; align-items:center;">
                    <b style="color:var(--primary)">BEST: ${s.best}</b>
                    <button class="btn-delete" onclick="eliminaSessione('${nome}', ${s.id})">🗑️</button>
                </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.8rem;">
                <div>⏱️ <b>Sess:</b> ${s.sess} (Pos: ${s.pos})</div>
                <div>🌡️ <b>Meteo:</b> ${s.meteo} (${s.pista})</div>
                <div style="grid-column:1/-1; background:#f9f9f9; padding:5px; border-radius:4px;">🔧 <b>Setup:</b> ${s.setupM}<br>${s.setupT}</div>
                <div style="grid-column:1/-1;">🛞 <b>Press:</b> ${s.press}</div>
            </div>`;
        container.appendChild(div);
    });
}

function aggiungiTabFiltro(n) {
    const c = document.getElementById('filtri-log');
    if (document.getElementById('btn-f-'+n)) return;
    const b = document.createElement('button');
    b.id='btn-f-'+n; b.className='btn-filter'; b.innerText="📂 "+n;
    b.onclick=() => mostraLogFiltrato(n);
    c.appendChild(b);
}

function eliminaSessione(p, id) {
    if(confirm("Eliminare?")) {
        databaseSessioni[p] = databaseSessioni[p].filter(x => x.id !== id);
        if(databaseSessioni[p].length === 0) { delete databaseSessioni[p]; localStorage.setItem('kartLogDB', JSON.stringify(databaseSessioni)); location.reload(); }
        else { localStorage.setItem('kartLogDB', JSON.stringify(databaseSessioni)); mostraLogFiltrato(p); }
    }
}

function calcDelta() {
    ['as','ad','ps','pd'].forEach(w => {
        const i = parseFloat(document.getElementById(w+'_in').value);
        const o = parseFloat(document.getElementById(w+'_out').value);
        const d = document.getElementById('d_'+w);
        if(!isNaN(i) && !isNaN(o)) { d.innerText = "Δ: " + (o-i).toFixed(2); d.style.color = (o-i) > 0.15 ? "var(--primary)" : "var(--success)"; }
    });
}

async function loadWeather() {
    const status = document.getElementById('weather-status');
    const circuitoNome = document.getElementById('select_circuito').value;
    
    // Trova i dati del circuito nel config per avere le coordinate
    const circData = CONFIG.circuiti.find(c => c.nome === circuitoNome);

    if (!circData || !circData.lat) {
        status.innerText = "❌ Coordinate non trovate per questa pista.";
        return;
    }

    status.innerText = "⏳ Collegamento satellitare...";

    try {
        // Chiamata all'API Open-Meteo usando lat e lon della pista
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${circData.lat}&longitude=${circData.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`);
        const data = await response.json();

        if (data.current) {
            const temp = data.current.temperature_2m;
            const umid = data.current.relative_humidity_2m;
            const code = data.current.weather_code;

            // Inserisce i dati reali nei campi
            document.getElementById('temp_aria').value = temp;
            document.getElementById('umidita').value = umid;
            
            // Calcolo approssimativo temperatura asfalto (Aria + 10° se c'è sole, Aria + 2° se nuvoloso)
            let stimaAsfalto = (code < 3) ? (temp + 12).toFixed(1) : (temp + 3).toFixed(1);
            document.getElementById('temp_asfalto').value = stimaAsfalto;

            // Traduzione codice meteo
            const desc = {
                0: "Soleggiato", 1: "Quasi Sole", 2: "Parz. Nuvoloso", 3: "Coperto",
                45: "Nebbia", 51: "Pioggerella", 61: "Pioggia", 80: "Rovescio"
            };
            document.getElementById('cond_meteo_live').value = desc[code] || "Variabile";

            status.innerHTML = `✅ Meteo reale aggiornato alle <b>${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</b>`;
        }
    } catch (error) {
        console.error(error);
        status.innerText = "❌ Errore di connessione meteo.";
    }
}

function esportaCSV() {
    let csv = "Data,Ora,Pilota,Circuito,Best,Setup,Pressioni\n";
    Object.values(databaseSessioni).flat().forEach(s => {
        csv += `${s.data},${s.ora},${s.pilota},${s.circ},${s.best},"${s.setupM} ${s.setupT}","${s.press}"\n`;
    });
    const b = new Blob([csv], {type:'text/csv'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download='KartLog.csv'; a.click();
}