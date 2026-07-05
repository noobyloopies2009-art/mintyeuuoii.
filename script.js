const DISCORD_ID = "1276859709235658804";

const entryScreen = document.getElementById('entry-screen');

let bgMusic; 
let trailsActive = false; 

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

entryScreen.addEventListener('click', (e) => {
    entryScreen.classList.add('fade-out');
    
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    
    lines.forEach((line) => {
        line.segments.forEach((seg) => {
            seg.x = e.clientX;
            seg.y = e.clientY;
            seg.vx = 0;
            seg.vy = 0;
        });
    });
    
    trailsActive = true; 
    
    if (bgMusic.paused) {
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

bgMusic.addEventListener('timeupdate', () => {
    const { duration, currentTime } = bgMusic;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentTimeEl.textContent = formatTime(currentTime);
});

bgMusic.addEventListener('loadeddata', () => {
    durationTimeEl.textContent = formatTime(bgMusic.duration);
});

progressContainer.addEventListener('click', (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = bgMusic.duration;
    
    if (duration) {
        bgMusic.currentTime = (clickX / width) * duration;
    }
});

function updatePlayerIcon() {
    if (bgMusic.paused) {
        playerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        playerPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
}

bgMusic.addEventListener('play', updatePlayerIcon);
bgMusic.addEventListener('pause', updatePlayerIcon);

playerPlayBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play();
    } else {
        bgMusic.pause();
    }
});

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
        bgMusic.volume = newVolume;
        isPlayerMuted = false;
        
        updateVolumeDisplay(newVolume);
    });
}

if (playerVolumeIcon) {
    playerVolumeIcon.addEventListener('click', () => {
        if (!isPlayerMuted) {
            bgMusic.volume = 0;
            if (volumeSliderBar) volumeSliderBar.style.width = '0%';
            playerVolumeIcon.className = 'fas fa-volume-mute volume-icon';
            isPlayerMuted = true;
        } else {
            bgMusic.volume = savedVolume;
            updateVolumeDisplay(savedVolume);
            isPlayerMuted = false;
        }
    });
}


const bioContainer = document.querySelector('.bio-container');

if (bioContainer) {
    bioContainer.addEventListener('mousemove', (e) => {
        const rect = bioContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const maxRotation = 15; 
        const rotateX = -y * maxRotation;
        const rotateY = x * maxRotation;
        
        bioContainer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
        bioContainer.style.boxShadow = `${-x * 30}px ${-y * 30}px 50px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.3)`;
    });

    bioContainer.addEventListener('mouseleave', () => {
        bioContainer.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        bioContainer.style.boxShadow = `0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.3)`;
    });
}

const canvas = document.getElementById('trail-canvas');
const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const nLines = 8;     
const nElements = 25; 
const lines = [];

if (canvas) {
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    for (let l = 0; l < nLines; l++) {
        const segments = [];
        for (let i = 0; i < nElements; i++) {
            segments.push({ x: pointer.x, y: pointer.y, vx: 0, vy: 0 });
        }
        lines.push({
            segments: segments,
            spring: 0.12 + (l * 0.01), 
            friction: 0.65
        });
    }

    window.addEventListener('mousemove', (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
    });

    function updateTrails() {
        ctx.shadowBlur = 0; 
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!trailsActive) {
            requestAnimationFrame(updateTrails);
            return;
        }

        lines.forEach((line, lineIndex) => {
            let targetX = pointer.x;
            let targetY = pointer.y;

            line.segments.forEach((seg) => {
                seg.vx += (targetX - seg.x) * line.spring;
                seg.vy += (targetY - seg.y) * line.spring;
                seg.vx *= line.friction;
                seg.vy *= line.friction;
                seg.x += seg.vx;
                seg.y += seg.vy;

                targetX = seg.x;
                targetY = seg.y;
            });

            ctx.beginPath();
            ctx.moveTo(line.segments[0].x, line.segments[0].y);

            for (let i = 1; i < line.segments.length - 1; i++) {
                const xc = (line.segments[i].x + line.segments[i + 1].x) / 2;
                const yc = (line.segments[i].y + line.segments[i + 1].y) / 2;
                ctx.quadraticCurveTo(line.segments[i].x, line.segments[i].y, xc, yc);
            }

            const dx = line.segments[0].x - line.segments[line.segments.length - 1].x;
            const dy = line.segments[0].y - line.segments[line.segments.length - 1].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            let alpha = (1 - (lineIndex / nLines)) * 0.35;
            if (distance < 2) {
                alpha = 0; 
            }

            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = Math.max(0.5, 1.5 - (lineIndex * 0.1));
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowBlur = 6;
            ctx.shadowColor = 'rgb(0, 0, 0)';
            
            ctx.stroke();
        });

        requestAnimationFrame(updateTrails);
    }

    updateTrails();
}

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