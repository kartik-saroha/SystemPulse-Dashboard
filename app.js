// ==========================================
// 0. AUTH & INIT
// ==========================================
(function checkAuth() {
    if (!localStorage.getItem('isLoggedIn')) window.location.href = 'login.html';
})();
function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

// Global Variables
let chaosMode = false;
let activeContainerCount = 4;
const processes = [
    { id: '10df', name: 'nginx-proxy', cpu: '2%', status: 'Running' },
    { id: '4a2b', name: 'auth-service', cpu: '14%', status: 'Running' },
    { id: '9c33', name: 'db-shard-01', cpu: '24%', status: 'Running' },
    { id: '7f88', name: 'redis-cache', cpu: '1%', status: 'Running' }
];

// ==========================================
// 1. PARTICLES & NAVIGATION
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    if(document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#38bdf8" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.5, "random": false },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#38bdf8", "opacity": 0.2, "width": 1 },
                "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } }, "push": { "particles_nb": 4 } }
            },
            "retina_detect": true
        });
    }
});

function switchView(viewName, linkElement) {
    // Skeleton Loading Effect
    const content = document.querySelectorAll('section');
    const skeleton = document.getElementById('skeleton-loader');
    
    // Hide all content
    content.forEach(el => el.classList.add('hidden'));
    
    // Show skeleton
    skeleton.classList.remove('hidden');
    
    // Update nav
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    linkElement.classList.add('active');

    // Fake delay for data loading
    setTimeout(() => {
        skeleton.classList.add('hidden');
        document.getElementById(viewName + '-view').classList.remove('hidden');
    }, 600);
}

function changeServer() {
    const select = document.getElementById('server-select');
    const region = select.options[select.selectedIndex].text;
    const statusText = document.getElementById('system-status-text');
    const statusDot = document.getElementById('status-dot');

    statusText.innerText = `Connecting to ${region}...`;
    statusText.style.color = "#facc15"; 
    statusDot.style.backgroundColor = "#facc15";
    statusDot.style.animation = "none";
    
    // Clear chart visually
    serverChart.data.datasets[0].data = new Array(10).fill(0);
    serverChart.update();

    setTimeout(() => {
        statusText.innerText = "System Online";
        statusText.style.color = "#4ade80";
        statusDot.style.backgroundColor = "#4ade80";
        statusDot.style.animation = "pulse-green 2s infinite";
        
        const logsContainer = document.getElementById('logs-list');
        const timeString = new Date().toLocaleTimeString('en-US', { hour12: false });
        const logHTML = `<div class="log-entry" style="border-left: 2px solid #38bdf8;"><span class="timestamp">[${timeString}]</span><span class="log-tag info">NET:</span><span class="log-msg">Switched active monitoring node to ${region}.</span></div>`;
        logsContainer.insertAdjacentHTML('afterbegin', logHTML);
    }, 1200);
}

// ==========================================
// 2. CHARTS
// ==========================================
const ctx = document.getElementById('serverChart').getContext('2d');
const serverChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s'],
        datasets: [{ label: 'Server Load', data: [20, 35, 40, 30, 45, 50, 65, 60, 70, 75], borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderWidth: 2, tension: 0.4, fill: true }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: true, grid: { color: '#334155' }, ticks: { color: '#94a3b8' } } } }
});

const ctxMem = document.getElementById('memoryChart').getContext('2d');
const memoryChart = new Chart(ctxMem, {
    type: 'doughnut',
    data: {
        labels: ['Used', 'Cached', 'Free'],
        datasets: [{ data: [45, 25, 30], backgroundColor: ['#38bdf8', '#818cf8', '#334155'], borderWidth: 0, hoverOffset: 4 }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 10 } } } }
});

// ==========================================
// 3. MAIN SIMULATION LOOP (Runs every 2s)
// ==========================================
setInterval(() => {
    let cpuVal, requestsVal;

    if (chaosMode) {
        cpuVal = Math.floor(Math.random() * (99 - 85) + 85);
        requestsVal = Math.floor(Math.random() * (5000 - 3000) + 3000);
        document.getElementById('ping-display').innerText = `${Math.floor(Math.random() * 500 + 100)}ms`;
        document.getElementById('ping-display').style.color = '#f87171';
    } else {
        cpuVal = Math.floor(Math.random() * (60 - 30) + 30);
        requestsVal = Math.floor(Math.random() * (1200 - 800) + 800);
        const ping = cpuVal > 80 ? Math.floor(Math.random() * (300 - 100) + 100) : Math.floor(Math.random() * (60 - 20) + 20);
        document.getElementById('ping-display').innerText = `${ping}ms`;
        document.getElementById('ping-display').style.color = cpuVal > 80 ? '#f87171' : '#94a3b8';
    }

    const cpuEl = document.getElementById('cpu-display');
    cpuEl.innerText = `${cpuVal}%`;
    cpuEl.style.color = cpuVal > 80 ? '#f87171' : '#ffffff';
    document.getElementById('requests-display').innerText = requestsVal;

    serverChart.data.datasets[0].data.push(cpuVal);
    serverChart.data.datasets[0].data.shift();
    serverChart.update();

    const usedMem = Math.floor(Math.random() * (60 - 40) + 40);
    const cachedMem = Math.floor(Math.random() * (30 - 20) + 20);
    const freeMem = 100 - usedMem - cachedMem;
    memoryChart.data.datasets[0].data = [usedMem, cachedMem, freeMem];
    memoryChart.update();

    renderProcesses();

    if(chaosMode && Math.random() > 0.6) {
        const logsContainer = document.getElementById('logs-list');
        const ips = ['192.168.1.44', '10.0.0.5', '172.16.0.1'];
        const randIP = ips[Math.floor(Math.random()*ips.length)];
        const timeString = new Date().toLocaleTimeString('en-US', { hour12: false });
        const logHTML = `<div class="log-entry" style="border-left: 3px solid #f87171"><span class="timestamp">[${timeString}]</span><span class="log-tag error">NET:</span><span class="log-msg">Packet loss detected from ${randIP}</span></div>`;
        logsContainer.insertAdjacentHTML('afterbegin', logHTML);
    }
}, 2000);

// ==========================================
// 4. UPTIME & PROCESS LIST
// ==========================================
let startTime = localStorage.getItem('systemStartTime');
if (!startTime) {
    startTime = Date.now() - (14 * 24 * 60 * 60 * 1000); 
    localStorage.setItem('systemStartTime', startTime);
}

setInterval(() => {
    const now = Date.now();
    const diff = now - startTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    document.getElementById('uptime-display').innerText = `Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`;
}, 1000);

function renderProcesses() {
    const tbody = document.getElementById('process-list-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    processes.forEach((proc, index) => {
        const liveCpu = proc.status === 'Running' ? Math.floor(Math.random() * 20) + '%' : '0%';
        const row = `
            <tr>
                <td><div class="process-name">${proc.name}</div></td>
                <td><span class="process-id">#${proc.id}</span></td>
                <td>${liveCpu}</td>
                <td><span class="status-badge ${proc.status.toLowerCase()}">${proc.status}</span></td>
                <td>
                    <button class="btn-danger-small" onclick="killProcess(${index})" ${proc.status === 'Stopped' ? 'disabled' : ''}>
                        <i class="fa-solid fa-power-off"></i> Kill
                    </button>
                </td>
            </tr>`;
        tbody.innerHTML += row;
    });
}

function killProcess(index) {
    const proc = processes[index];
    const logsContainer = document.getElementById('logs-list');
    const timeString = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logHTML = `<div class="log-entry" style="border-left: 2px solid #f87171; background: rgba(248,113,113,0.05);"><span class="timestamp">[${timeString}]</span><span class="log-tag critical">CRITICAL:</span><span class="log-msg">Process '${proc.name}' (PID: ${proc.id}) killed by admin.</span></div>`;
    logsContainer.insertAdjacentHTML('afterbegin', logHTML);
    processes[index].status = 'Stopped';
    renderProcesses();
}

// ==========================================
// 5. CHAOS MODE & GLITCH
// ==========================================
function toggleChaosMode() {
    chaosMode = !chaosMode;
    const btn = document.querySelector('button[onclick="toggleChaosMode()"]');
    const logsContainer = document.getElementById('logs-list');
    const title = document.getElementById('main-title');
    
    if (chaosMode) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> &nbsp; UNDER ATTACK';
        btn.style.boxShadow = "0 0 20px #f87171";
        btn.style.borderColor = "#f87171";
        btn.style.color = "#f87171";
        
        // Add Glitch Class
        title.classList.add('glitch');
        title.setAttribute('data-text', 'System Overview');

        logsContainer.insertAdjacentHTML('afterbegin', `<div class="log-entry" style="background: rgba(248,113,113,0.2); border-left: 4px solid #f87171;"><span class="timestamp">[ALERT]</span><span class="log-tag critical">CRITICAL:</span><span class="log-msg">DDoS DETECTED. TRAFFIC SPIKE INBOUND.</span></div>`);
    } else {
        btn.innerHTML = '<i class="fa-solid fa-biohazard"></i> &nbsp; SIMULATE DDOS ATTACK';
        btn.style.boxShadow = "none";
        btn.style.borderColor = "rgba(248, 113, 113, 0.3)";
        btn.style.color = "#f87171";
        
        // Remove Glitch Class
        title.classList.remove('glitch');
        
        logsContainer.insertAdjacentHTML('afterbegin', `<div class="log-entry" style="border-left: 4px solid #4ade80;"><span class="timestamp">[INFO]</span><span class="log-tag info">SYSTEM:</span><span class="log-msg">Threat mitigated. Traffic normalizing.</span></div>`);
    }
}

// ==========================================
// 6. TERMINAL & UTILS
// ==========================================
const logMessages = [
    { type: 'INFO', msg: 'Automated backup completed successfully' },
    { type: 'INFO', msg: 'User admin logged in from 192.168.1.4' },
    { type: 'ERROR', msg: 'Connection timeout: redis-cache (Retrying...)' },
    { type: 'INFO', msg: 'Garbage collection started' }
];

function addRandomLog() {
    if(chaosMode) return; 
    const logsContainer = document.getElementById('logs-list');
    const randomLog = logMessages[Math.floor(Math.random() * logMessages.length)];
    const timeString = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logHTML = `<div class="log-entry"><span class="timestamp">[${timeString}]</span><span class="log-tag ${randomLog.type.toLowerCase()}">${randomLog.type}:</span><span class="log-msg">${randomLog.msg}</span></div>`;
    logsContainer.insertAdjacentHTML('afterbegin', logHTML);
    if (logsContainer.children.length > 20) logsContainer.lastElementChild.remove();
}
setInterval(addRandomLog, 4000);

const cmdInput = document.getElementById('cmd-input');
if(cmdInput){
    cmdInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const command = cmdInput.value.trim();
            const termOut = document.getElementById('terminal-output');
            const div = document.createElement('div');
            div.className = 'line';
            div.textContent = `root@system-pulse:~$ ${command}`;
            termOut.appendChild(div);
            
            if(command === 'help') div.insertAdjacentHTML('afterend', '<div class="line">Commands: help, clear, ls, top, reboot</div>');
            else if(command === 'clear') termOut.innerHTML = '';
            else if(command === 'ls') div.insertAdjacentHTML('afterend', '<div class="line">config.json  docker-compose.yml  server.log  backup.tar.gz</div>');
            
            cmdInput.value = '';
            document.querySelector('.terminal-window').scrollTop = document.querySelector('.terminal-window').scrollHeight;
        }
    });
}

function downloadLogs() {
    const logEntries = document.querySelectorAll('.log-entry');
    let csvContent = "Timestamp,Log Level,Message\n";
    logEntries.forEach(entry => {
        csvContent += `${entry.innerText.replace(/\n/g, " ")}\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system_logs.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function saveSettings(event) {
    event.preventDefault();
    document.querySelector('.brand h2').innerText = document.getElementById('server-name-input').value;
    const toast = document.getElementById('toast');
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}