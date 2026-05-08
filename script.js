let databaseSessioni = JSON.parse(localStorage.getItem('kartLogDB')) || {};

const getV = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : "--";
};

function inizializzaApp() {
    if (typeof CONFIG === 'undefined') return;
    const mapping = {
        'select_circuito': CONFIG.circuiti.map(c => c.nome).sort(),
        'driver': CONFIG.piloti.sort(),
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
        'pos_spillo': CONFIG.setup.pos_spillo.sort(),
        'candela': CONFIG.setup.candela.sort()
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
        const checklistInputs = document.querySelectorAll('.check-item input[type="checkbox"]');
        let checkStatus = [];
        
        checklistInputs.forEach(input => {
            if(input.checked) {
                checkStatus.push(input.parentElement.textContent.trim());
            }
        });

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
            press: `ANT: ${getV('as_in')}/${getV('as_out')} - ${getV('ad_in')}/${getV('ad_out')} | POST: ${getV('ps_in')}/${getV('ps_out')} - ${getV('pd_in')}/${getV('pd_out')}`,
            manutenzione: checkStatus.length > 0 ? checkStatus.join(", ") : "Nessuna"
        };

        if (!databaseSessioni[p]) { 
            databaseSessioni[p] = []; 
            aggiungiTabFiltro(p); 
        }
        
        databaseSessioni[p].push(d);
        localStorage.setItem('kartLogDB', JSON.stringify(databaseSessioni));
        
        checklistInputs.forEach(input => input.checked = false);
        
        mostraLogFiltrato(p);
        alert("Sessione salvata con successo!");
    } catch (err) { 
        console.error(err);
        alert("Errore nel salvataggio."); 
    }
}

function mostraLogFiltrato(nome) {
    
    const container = document.getElementById('log');
    if (!container) return;

    
    container.innerHTML = `<h3 style="color:var(--primary); font-size:0.8rem; margin: 15px 0 10px 0;">📂 Cartella: ${nome}</h3>`;
    
    if (!databaseSessioni[nome] || databaseSessioni[nome].length === 0) return;

    databaseSessioni[nome].slice().reverse().forEach(s => {
        const div = document.createElement('div');
        div.className = 'summary';
        div.innerHTML = `
            <div class="summary-header">
                <span><b>${s.data} ${s.ora}</b> - ${s.circ}</span>
                <div style="display:flex; gap:10px; align-items:center;">
                    <b style="color:var(--primary)">BEST: ${s.best}</b>
                    <button class="btn-delete" onclick="eliminaSessione('${nome}', ${s.id})">🗑️</button>
                </div>
            </div>
            <div class="summary-grid">
                <div>${s.sess} (${s.pos}°)</div>
                <div>${s.meteo}</div>
                <div style="grid-column:1/-1; background:#f9f9f9; padding:8px; border-radius:6px; margin-top:5px; font-size:0.75rem;">
                    <div>${s.setupM}</div>
                    <div>${s.setupT}</div>
                    <div>${s.press}</div>
                    <div style="border-top:1px solid #ddd; margin:4px 0; padding-top:4px; color:var(--primary);"><b>Manutenzione:</b> ${s.manutenzione}</div>
                    
                </div>
            </div>`;
        container.appendChild(div);
    });

    
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
    const activeBtn = document.getElementById('btn-f-' + nome);
    if (activeBtn) activeBtn.classList.add('active');
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
    const nomePista = document.getElementById('select_circuito').value;
    const btnCal = document.getElementById('btn-apri-calendario');
    const infoPista = document.getElementById('info-pista-selezionata');
    const linkPistaVecchi = document.getElementById('pista_url'); // Il vecchio link se lo hai ancora

    // Trova i dati nel config
    const pistaData = CONFIG.circuiti.find(c => c.nome === nomePista);

    if (pistaData) {
        // Aggiorna il bottone del calendario
        btnCal.style.display = 'flex';
        btnCal.href = pistaData.cal;

        // Aggiorna il testo informativo
        infoPista.innerHTML = `
            <div style="border-left: 3px solid var(--primary); padding-left: 10px;">
                <strong>${pistaData.nome}</strong><br>
                <small>Orari, turni privati e giornate di chiusura per gare.</small>
            </div>
        `;

        // Se hai ancora il vecchio link "Vai al sito della pista" sotto al meteo
        if (linkPistaVecchi) {
            linkPistaVecchi.href = pistaData.url;
            linkPistaVecchi.style.display = 'block';
        }
    }
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
            status.innerHTML = `✅ Aggiornato alle ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
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