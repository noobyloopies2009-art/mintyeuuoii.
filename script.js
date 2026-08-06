const DISCORD_ID = "1276859709235658804";

const entryScreen = document.getElementById('entry-screen');

let bgMusic; 

const songTitleEl = document.getElementById('song-title');
const playerDiskImg = document.getElementById('player-disk-img');

function initRandomSongFromHTML() {
    const randomNumber = Math.floor(Math.random() * 2) + 1;
    
    bgMusic = document.getElementById(`music-track-${randomNumber}`);
    
    if (bgMusic) {
        const songTitle = bgMusic.getAttribute('data-title');
        const iconSrc = bgMusic.getAttribute('data-icon');
        
        if (songTitleEl) songTitleEl.textContent = songTitle;
        if (playerDiskImg) playerDiskImg.src = iconSrc;
    }
}

initRandomSongFromHTML();

entryScreen.addEventListener('click', () => {
    entryScreen.classList.add('fade-out');
    
    if (bgMusic && bgMusic.paused) {
        bgMusic.play().catch(err => console.log("Chờ tương tác để phát nhạc"));
    }
});

function updateDiscordStatus() {
    fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) return;

            const user = data.data;
            
            const avatarUrl = user.discord_user.avatar 
                ? `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${user.discord_user.avatar}.png?size=256`
                : "https://i.imgur.com/link-anh-mac-dinh.png";
                
            document.getElementById('discord-avatar').src = avatarUrl;
            document.getElementById('card-avatar').src = avatarUrl;
            document.getElementById('discord-username').textContent = user.discord_user.global_name || user.discord_user.username;

            const statusDot = document.getElementById('status-dot');
            const colors = { online: '#43b581', idle: '#faa61a', dnd: '#f04747', offline: '#747f8d' };
            statusDot.style.backgroundColor = colors[user.discord_status] || colors.offline;

            const activityElement = document.getElementById('discord-activity');
            const detailsElement = document.getElementById('discord-details');

            const customStatus = user.activities.find(act => act.type === 4);
            const gameActivity = user.activities.find(act => act.type !== 4);

            if (customStatus) {
                activityElement.textContent = "Idling";
                const emoji = customStatus.emoji ? `${customStatus.emoji.name} ` : '';
                detailsElement.textContent = `${emoji}${customStatus.state || ''}`;
            } else if (gameActivity) {
                activityElement.textContent = `Playing ${gameActivity.name}`;
                detailsElement.textContent = gameActivity.details ? `${gameActivity.details} - ${gameActivity.state || ''}` : '';
            } else {
                activityElement.textContent = "Idling";
                detailsElement.textContent = "love you, like always."; 
            }
        })
        .catch(err => console.error("Lỗi lấy dữ liệu Lanyard:", err));
}

updateDiscordStatus();
setInterval(updateDiscordStatus, 10000);

const currentTimeEl = document.getElementById('current-time');
const durationTimeEl = document.getElementById('duration-time');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const playerPlayBtn = document.getElementById('player-play-btn');

function formatTime(time) {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

if (bgMusic) {
    bgMusic.addEventListener('timeupdate', () => {
        const { duration, currentTime } = bgMusic;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(currentTime);
    });

    bgMusic.addEventListener('loadeddata', () => {
        durationTimeEl.textContent = formatTime(bgMusic.duration);
    });

    bgMusic.addEventListener('play', updatePlayerIcon);
    bgMusic.addEventListener('pause', updatePlayerIcon);
}

if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = bgMusic.duration;
        
        if (duration) {
            bgMusic.currentTime = (clickX / width) * duration;
        }
    });
}

function updatePlayerIcon() {
    if (bgMusic.paused) {
        playerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        playerPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
}

if (playerPlayBtn) {
    playerPlayBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
        } else {
            bgMusic.pause();
        }
    });
}

const playerVolumeIcon = document.getElementById('player-volume-icon');
const volumeSliderBg = document.getElementById('volume-slider-bg');
const volumeSliderBar = document.getElementById('volume-slider-bar');

let savedVolume = 0.8; 
let isPlayerMuted = false;

function updateVolumeDisplay(volumeLevel) {
    if (volumeSliderBar) {
        volumeSliderBar.style.width = (volumeLevel * 100) + '%';
    }
    if (playerVolumeIcon) {
        if (volumeLevel === 0) {
            playerVolumeIcon.className = 'fas fa-volume-mute volume-icon';
        } else if (volumeLevel < 0.4) {
            playerVolumeIcon.className = 'fas fa-volume-down volume-icon';
        } else {
            playerVolumeIcon.className = 'fas fa-volume-up volume-icon';
        }
    }
}

if (volumeSliderBg) {
    volumeSliderBg.addEventListener('click', (e) => {
        const rect = volumeSliderBg.getBoundingClientRect();
        const clickPositionX = e.clientX - rect.left;
        const totalWidth = rect.width;
        
        let newVolume = clickPositionX / totalWidth;
        if (newVolume < 0) newVolume = 0;
        if (newVolume > 1) newVolume = 1;
        
        savedVolume = newVolume;
        if (bgMusic) bgMusic.volume = newVolume;
        isPlayerMuted = false;
        
        updateVolumeDisplay(newVolume);
    });
}

if (playerVolumeIcon) {
    playerVolumeIcon.addEventListener('click', () => {
        if (!isPlayerMuted) {
            if (bgMusic) bgMusic.volume = 0;
            if (volumeSliderBar) volumeSliderBar.style.width = '0%';
            playerVolumeIcon.className = 'fas fa-volume-mute volume-icon';
            isPlayerMuted = true;
        } else {
            if (bgMusic) bgMusic.volume = savedVolume;
            updateVolumeDisplay(savedVolume);
            isPlayerMuted = false;
        }
    });
}

// Hiệu ứng nghiêng 3D Tilt khi di chuột
const bioContainer = document.querySelector('.bio-container');

if (bioContainer) {
    bioContainer.addEventListener('mousemove', (e) => {
        const rect = bioContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const maxRotation = 12; 
        const rotateX = -y * maxRotation;
        const rotateY = x * maxRotation;
        
        bioContainer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
        bioContainer.style.boxShadow = `inset 1.5px 1.5px 3px rgba(255, 255, 255, 0.3), inset 3px 3px 8px rgba(255, 255, 255, 0.15), ${-x * 25}px ${-y * 25}px 45px rgba(0, 0, 0, 0.65)`;
    });

    bioContainer.addEventListener('mouseleave', () => {
        bioContainer.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        bioContainer.style.boxShadow = `inset 1.5px 1.5px 3px rgba(255, 255, 255, 0.25), inset 3px 3px 8px rgba(255, 255, 255, 0.1), 0 20px 50px rgba(0, 0, 0, 0.6)`;
    });
}

// --- HIỆU ỨNG CANVAS CURSOR (RIBBON TRAIL) ---
(function () {
    var options = { color: "#ffffff", zIndex: 999999 };

    var config = {
        debug: true,
        friction: 0.5,
        trails: 20,
        size: 50,
        dampening: 0.2,
        tension: 0.98,
    };

    var canvas = null,
        ctx = null,
        raf = null;
    var segments = [];
    var pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    function Node() {
        this.x = pos.x;
        this.y = pos.y;
        this.vx = 0;
        this.vy = 0;
    }

    function Segment(spring) {
        this.spring = spring + (0.1 * Math.random() - 0.02);
        this.friction = config.friction + (0.01 * Math.random() - 0.002);
        this.nodes = [];
        for (var i = 0; i < config.size; i++) {
            this.nodes.push(new Node());
        }
    }

    Segment.prototype.update = function () {
        var spring = this.spring;
        var first = this.nodes[0];
        first.vx += (pos.x - first.x) * spring;
        first.vy += (pos.y - first.y) * spring;

        for (var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i];
            if (i > 0) {
                var prev = this.nodes[i - 1];
                node.vx += (prev.x - node.x) * spring;
                node.vy += (prev.y - node.y) * spring;
                node.vx += prev.vx * config.dampening;
                node.vy += prev.vy * config.dampening;
            }
            node.vx *= this.friction;
            node.vy *= this.friction;
            node.x += node.vx;
            node.y += node.vy;
            spring *= config.tension;
        }
    };

    Segment.prototype.draw = function () {
        var mx, my;
        var first = this.nodes[0];
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);

        for (var i = 1; i < this.nodes.length - 2; i++) {
            var cur = this.nodes[i];
            var next = this.nodes[i + 1];
            mx = 0.5 * (cur.x + next.x);
            my = 0.5 * (cur.y + next.y);
            ctx.quadraticCurveTo(cur.x, cur.y, mx, my);
        }

        var secondLast = this.nodes[this.nodes.length - 2];
        var last = this.nodes[this.nodes.length - 1];
        ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
        ctx.stroke();
        ctx.closePath();
    };

    function resize() {
        if (canvas && ctx) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    function loop() {
        if (ctx.running) {
            ctx.globalCompositeOperation = "source-over";
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.globalCompositeOperation = "lighter";
            ctx.strokeStyle =
                "rgba(" +
                parseInt(options.color.slice(1, 3), 16) + ", " +
                parseInt(options.color.slice(3, 5), 16) + ", " +
                parseInt(options.color.slice(5, 7), 16) +
                ", 0.2)";
            ctx.lineWidth = 1;
            for (var i = 0; i < segments.length; i++) {
                segments[i].update();
                segments[i].draw();
            }
            ctx.frame++;
            raf = window.requestAnimationFrame(loop);
        }
    }

    function firstMouseMove(e) {
        function track(e) {
            pos.x = e.touches ? e.touches[0].pageX : e.clientX;
            pos.y = e.touches ? e.touches[0].pageY : e.clientY;
        }

        document.removeEventListener("mousemove", firstMouseMove);
        document.removeEventListener("touchstart", firstMouseMove);

        document.addEventListener("mousemove", track);
        document.addEventListener("touchmove", track);
        document.addEventListener("touchstart", function (ev) {
            if (ev.touches.length == 1) {
                pos.x = ev.touches[0].pageX;
                pos.y = ev.touches[0].pageY;
            }
        });

        track(e);

        segments = [];
        for (var i = 0; i < config.trails; i++) {
            segments.push(new Segment(0.4 + (i / config.trails) * 0.025));
        }
        loop();
    }

    canvas = document.getElementById("trail-canvas");
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.id = "trail-canvas";
        document.body.appendChild(canvas);
    }
    
    ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.style.position = "fixed";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = options.zIndex.toString();

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.running = true;
    ctx.frame = 1;

    document.addEventListener("mousemove", firstMouseMove);
    document.addEventListener("touchstart", firstMouseMove);
    document.body.addEventListener("orientationchange", resize);
    window.addEventListener("resize", resize);

    window.addEventListener("focus", function () {
        if (!ctx.running) {
            ctx.running = true;
            loop();
        }
    });
    window.addEventListener("blur", function () {
        ctx.running = true;
    });

    resize();
})();

document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', (e) => {
    if (e.keyCode === 123) {
        e.preventDefault();
        return false;
    }
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 'I'.charCodeAt(0) || e.keyCode === 'C'.charCodeAt(0) || e.keyCode === 'J'.charCodeAt(0))) {
        e.preventDefault();
        return false;
    }
    if (e.ctrlKey && e.keyCode === 'U'.charCodeAt(0)) {
        e.preventDefault();
        return false;
    }
});