let databaseSessioni = JSON.parse(localStorage.getItem('kartLogDB')) || {};

// Funzione di utilità per leggere i valori senza mandare in crash lo script
const getV = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : "--";
};

function inizializzaApp() {
    if (typeof CONFIG === 'undefined') return;
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

function salvaSessione() {
    try {
        const p = getV('driver');
        
        const d = {
            id: Date.now(),
            data: new Date().toLocaleDateString(),
            ora: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
            circ: getV('select_circuito'),
            pilota: p,
            sess: getV('sessione'),
            best: getV('best') || "--",
            pos: getV('pos'),
            meteo: `${getV('temp_aria')}°A / ${getV('temp_asfalto')}°Asf`,
            pista: getV('cond_pista'),
            setupM: `Rapp: ${getV('rapporto')} | Spillo: ${getV('pos_spillo')} | Getto: ${getV('getto_max')} | Candela: ${getV('candela')}`,
            setupT: `Cb: ${getV('camber')} | Cs: ${getV('caster')} | Cv: ${getV('convergenza')} | H: ${getV('altezza_ant')}/${getV('altezza_post')} | Peso: ${getV('peso')}kg`,
            press: `ANT: ${getV('as_in')}/${getV('as_out')} - ${getV('ad_in')}/${getV('ad_out')} | POST: ${getV('ps_in')}/${getV('ps_out')} - ${getV('pd_in')}/${getV('pd_out')}`
        };

        if (!databaseSessioni[p]) { 
            databaseSessioni[p] = []; 
            aggiungiTabFiltro(p); 
        }
        databaseSessioni[p].push(d);
        localStorage.setItem('kartLogDB', JSON.stringify(databaseSessioni));
        mostraLogFiltrato(p);
        /* alert("Sessione salvata con successo!"); */
    } catch (err) {
        console.error(err);
        alert("Errore durante il salvataggio. Controlla la console.");
    }
}

function mostraLogFiltrato(nome) {
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('btn-f-' + nome);
    if (btn) btn.classList.add('active');

    const container = document.getElementById('log');
    container.innerHTML = `<h3 style="color:var(--primary); font-size:0.8rem; margin-top:20px;">📂 Cartella: ${nome}</h3>`;
    
    if (!databaseSessioni[nome]) return;

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
                <div style="grid-column:1/-1; background:#f9f9f9; padding:5px; border-radius:4px;">🔧 <b>Motore:</b> ${s.setupM}<br>🏎️ <b>Telaio:</b> ${s.setupT}</div>
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
    if(confirm("Eliminare la sessione?")) {
        databaseSessioni[p] = databaseSessioni[p].filter(x => x.id !== id);
        if(databaseSessioni[p].length === 0) { 
            delete databaseSessioni[p]; 
            localStorage.setItem('kartLogDB', JSON.stringify(databaseSessioni)); 
            location.reload(); 
        } else { 
            localStorage.setItem('kartLogDB', JSON.stringify(databaseSessioni)); 
            mostraLogFiltrato(p); 
        }
    }
}

function updateCircuitLink() {
    const v = document.getElementById('select_circuito').value;
    const l = document.getElementById('pista_url');
    const c = CONFIG.circuiti.find(i => i.nome === v);
    if (c && l) { l.href = c.url; l.style.display = 'block'; }
}

function calcDelta() {
    ['as','ad','ps','pd'].forEach(w => {
        const iEl = document.getElementById(w+'_in');
        const oEl = document.getElementById(w+'_out');
        const d = document.getElementById('d_'+w);
        if(iEl && oEl && d) {
            const i = parseFloat(iEl.value);
            const o = parseFloat(oEl.value);
            if(!isNaN(i) && !isNaN(o)) { 
                d.innerText = "Δ: " + (o-i).toFixed(2); 
                d.style.color = (o-i) > 0.15 ? "var(--primary)" : "var(--success)"; 
            }
        }
    });
}

async function loadWeather() {
    const status = document.getElementById('weather-status');
    const circNome = document.getElementById('select_circuito').value;
    const circData = CONFIG.circuiti.find(c => c.nome === circNome);
    if (!circData) return;
    status.innerText = "⏳ Aggiornamento...";
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${circData.lat}&longitude=${circData.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`);
        const data = await response.json();
        if (data.current) {
            document.getElementById('temp_aria').value = data.current.temperature_2m;
            document.getElementById('umidita').value = data.current.relative_humidity_2m;
            document.getElementById('temp_asfalto').value = (data.current.weather_code < 3) ? (data.current.temperature_2m + 12).toFixed(1) : (data.current.temperature_2m + 3).toFixed(1);
            document.getElementById('cond_meteo_live').value = data.current.weather_code < 3 ? "Sole" : "Variabile";
            status.innerHTML = `✅ Meteo aggiornato alle ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }
    } catch (e) { status.innerText = "❌ Errore meteo."; }
}

function esportaCSV() {
    if (Object.keys(databaseSessioni).length === 0) return alert("Nessun dato!");
    let csv = "\ufeffData,Ora,Pilota,Circuito,Best,Motore,Telaio,Pressioni\n";
    Object.keys(databaseSessioni).forEach(pNome => {
        databaseSessioni[pNome].forEach(s => {
            csv += `${s.data},${s.ora},${pNome},${s.circ},${s.best},"${s.setupM}","${s.setupT}","${s.press}"\n`;
        });
    });
    const b = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'KartLog_Export.csv';
    a.click();
}