const audioPlayer = document.getElementById('audio-player');
const playBtn = document.querySelector('.play-btn');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const progressBar = document.querySelector('.progress-bar');
const progress = document.querySelector('.progress');
const currentTimeSpan = document.querySelector('.current-time');
const totalDurationSpan = document.querySelector('.total-duration');

// Playlist array - add your songs here
const playlist = [
    {
        title: "Mortals Tokyo",
        artist: "Warriyo",
        audio: "music/mortals-tokyo.mp3",
        cover: "covers/mortals-tokyo.jpg"
    },
    {
        title: "Carry On",
        artist: "Rivalz",
        audio: "music/carry-on.mp3",
        cover: "covers/carry-on.jpg"
    }
    // Add more songs as needed
];

let currentSongIndex = 0;

// Add these constants at the top with other constants
const STORAGE_KEYS = {
    CURRENT_SONG: 'currentSongIndex',
    CURRENT_TIME: 'currentTime',
    COMMENTS: 'songComments',
    THEME: 'theme'
};

// Add new control elements
const speedSlider = document.querySelector('.speed-slider');
const speedValue = document.querySelector('.speed-value');
const volumeSlider = document.querySelector('.volume-slider');
const volumeValue = document.querySelector('.volume-value');
const commentInput = document.querySelector('.comment-input');
const saveCommentBtn = document.querySelector('.save-comment');
const commentsList = document.querySelector('.comments-list');

// Play/Pause functionality
playBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audioPlayer.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
});

// Update progress bar
audioPlayer.addEventListener('timeupdate', () => {
    const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progress.style.width = `${percentage}%`;
    
    // Update current time
    const currentMinutes = Math.floor(audioPlayer.currentTime / 60);
    const currentSeconds = Math.floor(audioPlayer.currentTime % 60);
    currentTimeSpan.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
    
    // Save current time
    localStorage.setItem(STORAGE_KEYS.CURRENT_TIME, audioPlayer.currentTime.toString());
    localStorage.setItem(STORAGE_KEYS.CURRENT_SONG, currentSongIndex.toString());
});

// Click on progress bar to seek
progressBar.addEventListener('click', (e) => {
    const progressBarRect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - progressBarRect.left;
    const percentage = clickPosition / progressBarRect.width;
    audioPlayer.currentTime = percentage * audioPlayer.duration;
});

// Load song duration
audioPlayer.addEventListener('loadedmetadata', () => {
    const minutes = Math.floor(audioPlayer.duration / 60);
    const seconds = Math.floor(audioPlayer.duration % 60);
    totalDurationSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Next and Previous buttons
nextBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
});

prevBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
});

// Load song function
function loadSong(index) {
    const song = playlist[index];
    audioPlayer.src = song.audio;  // Changed from song.src to song.audio
    document.querySelector('.song-title').textContent = song.title;
    document.querySelector('.artist').textContent = song.artist;
    document.querySelector('.album-cover img').src = song.cover;
    
    // Save current song index
    localStorage.setItem(STORAGE_KEYS.CURRENT_SONG, index.toString());
    
    audioPlayer.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    
    // Update speed and volume display
    speedValue.textContent = `${audioPlayer.playbackRate}x`;
    volumeValue.textContent = `${Math.round(audioPlayer.volume * 100)}%`;
    
    // Load comments for current song
    loadComments();
}

// Update keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // If in comment input, allow normal typing
    if (document.activeElement === commentInput) {
        return;
    }

    switch(e.code) {
        case 'Space':
            e.preventDefault();
            if (audioPlayer.paused) {
                audioPlayer.play();
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                audioPlayer.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
            break;
        case 'ArrowRight':
            nextBtn.click();
            break;
        case 'ArrowLeft':
            prevBtn.click();
            break;
        case 'KeyD':
            audioPlayer.playbackRate = Math.min(audioPlayer.playbackRate + 0.25, 2);
            break;
        case 'KeyS':
            audioPlayer.playbackRate = Math.max(audioPlayer.playbackRate - 0.25, 0.25);
            break;
        case 'KeyM':
            e.preventDefault();
            audioPlayer.volume = Math.min(audioPlayer.volume + 0.1, 1);
            break;
    }
});

// Replace the existing load event listener with this one
window.addEventListener('load', () => {
    // Restore last played song and position
    const savedSongIndex = localStorage.getItem(STORAGE_KEYS.CURRENT_SONG);
    const savedTime = localStorage.getItem(STORAGE_KEYS.CURRENT_TIME);
    
    if (savedSongIndex) {
        currentSongIndex = parseInt(savedSongIndex);
    }
    
    loadSong(currentSongIndex);
    
    if (savedTime) {
        audioPlayer.currentTime = parseFloat(savedTime);
    }
    
    audioPlayer.pause();
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    
    // Set initial theme
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const systemTheme = prefersDark.matches ? 'dark' : 'light';
    setTheme(savedTheme || systemTheme);
    
    // Start playing automatically
    audioPlayer.play().catch(() => {
        // Auto-play prevented by browser
        console.log('Autoplay prevented');
    });
});

// Speed control
speedSlider.addEventListener('input', (e) => {
    currentSpeedIndex = speedPresets.findIndex(speed => 
        Math.abs(speed - parseFloat(e.target.value)) < 0.1
    );
    const speed = speedPresets[currentSpeedIndex];
    audioPlayer.playbackRate = speed;
    speedValue.textContent = `${speed}x`;
});

// Volume control
volumeSlider.addEventListener('input', (e) => {
    const volume = parseFloat(e.target.value);
    audioPlayer.volume = volume;
    volumeValue.textContent = `${Math.round(volume * 100)}%`;
    updateVolumeIcon(volume);
});

// Comments functionality
function loadComments() {
    const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS) || '{}');
    const songComments = comments[currentSongIndex] || [];
    commentsList.innerHTML = songComments
        .filter(comment => !comment.parentId)
        .map(comment => renderComment(comment))
        .join('');
}

function saveComment() {
    const comment = commentInput.value.trim();
    if (!comment) return;

    addComment(comment);
    commentInput.value = '';
    loadComments();
}

saveCommentBtn.addEventListener('click', saveComment);

// Update theme function
function setTheme(theme) {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    
    // Update theme toggle icon
    const themeToggle = document.querySelector('.theme-toggle i');
    themeToggle.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Add theme toggle button listener
document.querySelector('.theme-toggle').addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
});

// Check system theme preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
prefersDark.addEventListener('change', (e) => {
    const theme = e.matches ? 'dark' : 'light';
    setTheme(theme);
});

// Add autoplay functionality
audioPlayer.addEventListener('ended', () => {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
});

// YouTube-style speed presets
const speedPresets = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
let currentSpeedIndex = 3; // Default 1x speed

// Modify the speed container HTML
document.querySelector('.speed-container').innerHTML = `
    <div class="speed-options">
        <button class="speed-btn" data-speed="0.5">0.5x</button>
        <button class="speed-btn" data-speed="1">1x</button>
        <button class="speed-btn" data-speed="1.5">1.5x</button>
        <button class="speed-btn" data-speed="2">2x</button>
    </div>
`;

// Add volume icon update
function updateVolumeIcon(volume) {
    const volumeIcon = document.querySelector('.volume-container i');
    if (volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

// Enhanced comment system
function addComment(text, parentId = null) {
    const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS) || '{}');
    if (!comments[currentSongIndex]) {
        comments[currentSongIndex] = [];
    }

    const newComment = {
        id: Date.now(),
        text,
        parentId,
        replies: [],
        timestamp: new Date().toISOString()
    };

    if (parentId) {
        // Add reply to parent comment
        const parentComment = findComment(comments[currentSongIndex], parentId);
        if (parentComment) {
            parentComment.replies.push(newComment);
        }
    } else {
        comments[currentSongIndex].push(newComment);
    }

    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    loadComments();
}

function findComment(comments, id) {
    for (let comment of comments) {
        if (comment.id === id) return comment;
        if (comment.replies) {
            const found = findComment(comment.replies, id);
            if (found) return found;
        }
    }
    return null;
}

function renderComment(comment) {
    return `
        <div class="comment-item" data-id="${comment.id}">
            <div class="comment-content">
                <p>${comment.text}</p>
                <small>${new Date(comment.timestamp).toLocaleString()}</small>
                <button class="reply-btn">Reply</button>
            </div>
            ${comment.replies.length ? `
                <div class="comment-replies">
                    ${comment.replies.map(reply => renderComment(reply)).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// Speed control using buttons
document.querySelector('.speed-options').addEventListener('click', (e) => {
    if (e.target.classList.contains('speed-btn')) {
        const speed = parseFloat(e.target.dataset.speed);
        audioPlayer.playbackRate = speed;
        speedValue.textContent = `${speed}x`;
        document.querySelectorAll('.speed-btn').forEach(btn => 
            btn.classList.toggle('active', btn.dataset.speed === String(speed))
        );
    }
});

// Update theme toggle
document.querySelector('.theme-toggle').addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
    document.querySelector('.theme-toggle i').className = 
        isDark ? 'fas fa-sun' : 'fas fa-moon';
});

// Handle reply buttons
commentsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('reply-btn')) {
        const commentItem = e.target.closest('.comment-item');
        const parentId = parseInt(commentItem.dataset.id);
        const replyInput = document.createElement('div');
        replyInput.className = 'reply-input';
        replyInput.innerHTML = `
            <textarea placeholder="Write a reply..."></textarea>
            <button class="save-reply">Reply</button>
        `;
        commentItem.appendChild(replyInput);
        
        replyInput.querySelector('.save-reply').addEventListener('click', () => {
            const text = replyInput.querySelector('textarea').value.trim();
            if (text) {
                addComment(text, parentId);
                replyInput.remove();
            }
        });
    }
});
