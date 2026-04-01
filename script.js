var loggedIn = false;

function showLoginPage() {
    var login = document.getElementById('login-section');
    var portal = document.getElementById('portal-section');
    
    login.style.visibility = 'visible';
    portal.style.visibility = 'hidden';
}

function showPortalPage() {
    var login = document.getElementById('login-section');
    var portal = document.getElementById('portal-section');
    
    login.style.visibility = 'hidden';
    portal.style.visibility = 'visible';
}

function handleLogin(event) {
    event.preventDefault();
    
    var user = document.getElementById('username').value;
    var pass = document.getElementById('password').value;
    var error = document.getElementById('login-error');
    
    if (user == 'student' && pass == 'vit123' || user == 'faculty' && pass == 'vit123') {
        loggedIn = true;
        error.textContent = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        showPortalPage();
        showHome();
    } else {
        error.textContent = 'Wrong password';
    }
}

function handleLogout() {
    loggedIn = false;
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    showLoginPage();
}

function showHome() {
    var page1 = document.getElementById('home');
    var page2 = document.getElementById('dept');
    var page3 = document.getElementById('time');
    var page4 = document.getElementById('notice');
    var page5 = document.getElementById('contact');
    var page6 = document.getElementById('canvas');
    
    page1.style.display = 'block';
    page2.style.display = 'none';
    page3.style.display = 'none';
    page4.style.display = 'none';
    page5.style.display = 'none';
    page6.style.display = 'none';
    
    var link1 = document.querySelector('[onclick="show(\'home\', this)"]');
    var link2 = document.querySelector('[onclick="show(\'dept\', this)"]');
    var link3 = document.querySelector('[onclick="show(\'time\', this)"]');
    var link4 = document.querySelector('[onclick="show(\'notice\', this)"]');
    var link6 = document.querySelector('[onclick="show(\'canvas\', this)"]');
    var link5 = document.querySelector('[onclick="show(\'contact\', this)"]');
    
    link1.classList.add('active');
    link2.classList.remove('active');
    link3.classList.remove('active');
    link4.classList.remove('active');
    link6.classList.remove('active');
    link5.classList.remove('active');
}

function show(pageId, clickedLink) {
    var page1 = document.getElementById('home');
    var page2 = document.getElementById('dept');
    var page3 = document.getElementById('time');
    var page4 = document.getElementById('notice');
    var page5 = document.getElementById('contact');
    var page6 = document.getElementById('canvas');
    
    page1.style.display = 'none';
    page2.style.display = 'none';
    page3.style.display = 'none';
    page4.style.display = 'none';
    page5.style.display = 'none';
    page6.style.display = 'none';
    
    var activePage = document.getElementById(pageId);
    activePage.style.display = 'block';
    
    var link1 = document.querySelector('[onclick="show(\'home\', this)"]');
    var link2 = document.querySelector('[onclick="show(\'dept\', this)"]');
    var link3 = document.querySelector('[onclick="show(\'time\', this)"]');
    var link4 = document.querySelector('[onclick="show(\'notice\', this)"]');
    var link6 = document.querySelector('[onclick="show(\'canvas\', this)"]');
    var link5 = document.querySelector('[onclick="show(\'contact\', this)"]');
    
    link1.classList.remove('active');
    link2.classList.remove('active');
    link3.classList.remove('active');
    link4.classList.remove('active');
    link6.classList.remove('active');
    link5.classList.remove('active');
    
    clickedLink.classList.add('active');
}

function initPortal() {
    var login = document.getElementById('login-section');
    var portal = document.getElementById('portal-section');
    if (login && portal) {
        showLoginPage();
    }
}

function initCanvasTools() {
    var examDate = document.getElementById('examDate');
    var countdownCanvas = document.getElementById('countdownCanvas');
    var countdownText = document.getElementById('countdownText');
    var attendanceInput = document.getElementById('attendanceInput');
    var attendanceNumber = document.getElementById('attendanceNumber');
    var gaugeCanvas = document.getElementById('gaugeCanvas');
    var gaugeText = document.getElementById('gaugeText');
    var firebaseStatus = document.getElementById('firebaseStatus');

    if (!examDate || !countdownCanvas || !countdownText || !attendanceInput || !attendanceNumber || !gaugeCanvas || !gaugeText) {
        return;
    }

    var cloud = {
        enabled: false,
        docRef: null
    };
    var localKey = 'canvasToolsData';

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function setDefaultExamDate() {
        if (!examDate.value) {
            var d = new Date();
            d.setDate(d.getDate() + 45);
            examDate.value = d.toISOString().split('T')[0];
        }
    }

    function setStatus(message, color) {
        if (!firebaseStatus) {
            return;
        }
        firebaseStatus.textContent = message;
        firebaseStatus.style.color = color || '#666';
    }

    function saveToLocal() {
        var payload = {
            examDate: examDate.value,
            attendance: parseInt(attendanceNumber.value, 10) || 0,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(localKey, JSON.stringify(payload));
    }

    function loadFromLocal() {
        var raw = localStorage.getItem(localKey);
        if (!raw) {
            setDefaultExamDate();
            return;
        }

        try {
            var data = JSON.parse(raw);
            if (data.examDate) {
                examDate.value = data.examDate;
            } else {
                setDefaultExamDate();
            }
            if (typeof data.attendance === 'number') {
                attendanceNumber.value = data.attendance;
                attendanceInput.value = data.attendance;
            }
        } catch (e) {
            setDefaultExamDate();
        }
    }

    function initFirebase() {
        if (typeof firebase === 'undefined') {
            setStatus('Firebase SDK not loaded. Add script tags in canvas-tools.html.', '#a67c00');
            return;
        }

        var firebaseConfig = {
            apiKey: '',
            authDomain: '',
            databaseURL: '',
            projectId: '',
            storageBucket: '',
            messagingSenderId: '',
            appId: '',
            measurementId: ''
        };

        if (firebaseConfig.apiKey === 'YOUR_API_KEY') {
            setStatus('Add your Firebase keys in script.js to enable cloud save.', '#a67c00');
            return;
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        cloud.docRef = firebase.firestore().collection('portalData').doc('canvasTools');
        cloud.enabled = true;

        if (window.location.protocol === 'file:') {
            setStatus('Open using http://localhost (not file://) for stable Firebase connection.', '#a67c00');
        } else {
            setStatus('Firebase connected. Data will save online.', '#1e8449');
        }
    }

    function saveToFirebase() {
        saveToLocal();

        if (!cloud.enabled) {
            return;
        }

        cloud.docRef.set({
            examDate: examDate.value,
            attendance: parseInt(attendanceNumber.value, 10) || 0,
            updatedAt: new Date().toISOString()
        }, { merge: true }).catch(function (err) {
            var reason = err && err.message ? err.message : 'unknown error';
            setStatus('Firebase save failed (' + reason + '). Local save still works.', '#c0392b');
        });
    }

    function loadFromFirebase() {
        loadFromLocal();

        if (!cloud.enabled) {
            drawCountdown();
            drawGauge();
            return;
        }

        cloud.docRef.get().then(function (snap) {
            if (snap.exists) {
                var data = snap.data();
                if (data.examDate) {
                    examDate.value = data.examDate;
                }
                if (typeof data.attendance === 'number') {
                    attendanceNumber.value = data.attendance;
                    attendanceInput.value = data.attendance;
                }
            } else {
                setDefaultExamDate();
            }

            drawCountdown();
            drawGauge();
        }).catch(function (err) {
            var reason = err && err.message ? err.message : 'unknown error';
            setStatus('Firebase load failed (' + reason + '). Using local values.', '#c0392b');
            drawCountdown();
            drawGauge();
        });
    }

    function drawCountdown(shouldSave) {
        var selected = examDate.value;
        if (!selected) {
            countdownText.textContent = 'Please select an exam date';
            return;
        }

        var ctx = countdownCanvas.getContext('2d');
        var today = new Date();
        var exam = new Date(selected);
        today.setHours(0, 0, 0, 0);
        exam.setHours(0, 0, 0, 0);

        var daysLeft = Math.ceil((exam - today) / 86400000);
        var progress = clamp((100 - daysLeft) / 100, 0, 1);
        var cx = 160;
        var cy = 160;
        var r = 105;

        ctx.clearRect(0, 0, countdownCanvas.width, countdownCanvas.height);
        ctx.lineWidth = 16;
        ctx.strokeStyle = '#e7edf5';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#4a7ba7';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        ctx.stroke();

        var main = 'Done';
        var sub = 'Exam passed';
        if (daysLeft > 0) {
            main = String(daysLeft);
            sub = 'days left';
            countdownText.textContent = daysLeft + ' day(s) left for exam';
        } else if (daysLeft === 0) {
            main = '0';
            sub = 'Exam today';
            countdownText.textContent = 'Exam is today';
        } else {
            countdownText.textContent = 'Exam date already passed';
        }

        ctx.fillStyle = '#1a4d7a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 32px Segoe UI';
        ctx.fillText(main, cx, cy - 10);
        ctx.font = '14px Segoe UI';
        ctx.fillText(sub, cx, cy + 24);

        if (shouldSave) {
            saveToFirebase();
        }
    }

    function drawGauge(shouldSave) {
        var value = clamp(parseInt(attendanceNumber.value, 10) || 0, 0, 100);
        attendanceInput.value = value;
        attendanceNumber.value = value;

        var ctx = gaugeCanvas.getContext('2d');
        var cx = 160;
        var cy = 170;
        var r = 110;
        var angle = Math.PI + (value / 100) * Math.PI;

        ctx.clearRect(0, 0, gaugeCanvas.width, gaugeCanvas.height);
        ctx.lineWidth = 16;

        ctx.strokeStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI, Math.PI * 1.5);
        ctx.stroke();

        ctx.strokeStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI * 1.5, Math.PI * 1.8);
        ctx.stroke();

        ctx.strokeStyle = '#27ae60';
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI * 1.8, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 88 * Math.cos(angle), cy + 88 * Math.sin(angle));
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#2c3e50';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#2c3e50';
        ctx.fill();

        ctx.fillStyle = '#1a4d7a';
        ctx.textAlign = 'center';
        ctx.font = 'bold 28px Segoe UI';
        ctx.fillText(value + '%', cx, 118);

        if (value < 75) {
            gaugeText.textContent = 'Low attendance. Minimum target is 75%.';
            gaugeText.style.color = '#c0392b';
        } else if (value < 85) {
            gaugeText.textContent = 'Average attendance. Try to improve.';
            gaugeText.style.color = '#b9770e';
        } else {
            gaugeText.textContent = 'Good attendance. Keep it up.';
            gaugeText.style.color = '#1e8449';
        }

        if (shouldSave) {
            saveToFirebase();
        }
    }

    function updateGaugeFromSlider() {
        attendanceNumber.value = attendanceInput.value;
        drawGauge();
    }

    window.drawCountdown = drawCountdown;
    window.drawGauge = drawGauge;
    window.updateGaugeFromSlider = updateGaugeFromSlider;

    window.addEventListener('offline', function () {
        setStatus('Network looks offline. Local data is still available.', '#a67c00');
    });

    window.addEventListener('online', function () {
        setStatus('Back online. Syncing with Firebase...', '#1e8449');
        loadFromFirebase();
    });

    initFirebase();
    loadFromFirebase();
}

initPortal();
initCanvasTools();
