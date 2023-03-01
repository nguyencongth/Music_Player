
/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play/ pause/ seek
 * 4. CD rotate
 * 5. Next/ prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const playList = $('.playlist');
const cd = $('.cd');
const titleSong = $('header h2');
const thumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const seekBar = $('#progress');
const prev_Btn = $('.btn-prev');
const next_Btn = $('.btn-next');
const random_Btn = $('.btn-random');
const repeat_Btn = $('.btn-repeat');

const volumeElement = $('.progress1.volume');
const volume = $('.btn-volume');


const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER_STORAGE';



const app = {
    currentIndex: 0,
    isPlaying: false,
    isRepeat: false,
    isRandom: false,
    isVolume: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Chúng ta của hiện tại',
            singer: 'Sơn Tùng M-TP',
            path: './assets/music/chungtacuahientai.mp3',
            image: './assets/img/music-chungtacuahientai.jpg'
        },
        {
            name: 'Chạy ngay đi',
            singer: 'Sơn Tùng M-TP',
            path: './assets/music/chayngaydi.mp3',
            image: './assets/img/music-chayngaydi.jpg'
        },
        {
            name: 'Bông hoa đẹp nhất',
            singer: 'Quân AP',
            path: './assets/music/BongHoaDepNhat.mp3',
            image: './assets/img/music-bonghoadepnhat.jpg'
        },
        {
            name: 'Rằng em mãi ở bên',
            singer: 'Bích Phương',
            path: './assets/music/RangEmMaiOBen.mp3',
            image: './assets/img/bichphuong.jpg'
        },
        {
            name: 'Nàng tiên cá',
            singer: 'Hòa Minzy',
            path: './assets/music/NangTienCa.mp3',
            image: './assets/img/hoaminzy.jpg'
        },
        {
            name: 'Waiting for you',
            singer: 'Mono',
            path: './assets/music/WaitingForYou.mp3',
            image: './assets/img/mono.jpg'
        },
        {
            name: 'Ước mơ của mẹ',
            singer: 'Quân AP',
            path: './assets/music/UocMoCuaMe.mp3',
            image: './assets/img/music-uocmocuame.jpg'
        },
        {
            name: 'Cơn mưa ngang qua',
            singer: 'Sơn Tùng M-TP',
            path: './assets/music/ConMuaNgangQua.mp3',
            image: './assets/img/music-commuaxadan.jpg'
        }
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function () {
        const _this = this;
        const htmls = this.songs.map(function (song, index) {
            return `
                <div class="song ${index === _this.currentIndex ? 'active' : ''}" data-index = "${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })

        playList.innerHTML = htmls.join('');
    },
    handleEvents: function () {
        const cdWidth = cd.offsetWidth;
        const _this = this;

        // xử lý CD quay / dừng
        const thumbAnimate = thumb.animate([
            {
                transform: 'rotate(360deg)'
            }
        ], {
            duration: 10000,
            iterations: Infinity // lặp vô hạn iterations: lặp đi lặp lại
        })
        thumbAnimate.pause();

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            }
            else {
                audio.play();
            }
        };

        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            thumbAnimate.play();
        };

        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            thumbAnimate.pause();
        };



        audio.ontimeupdate = function () {
            if (audio.duration) {
                const seek = Math.floor(audio.currentTime / audio.duration * 100);
                // console.log(seek);
                seekBar.value = seek;
                // console.log(audio.currentTime);
            }
            function formTime(time) {
                if(time < 10)
                    return '0' + time
                return time + ''
            }
            let date1 = new Date(Math.floor(audio.currentTime * 1000))
            let minute = date1.getMinutes();
            let second = date1.getSeconds();
            minute = formTime(minute)
            second = formTime(second)

            let totalTime = (audio.duration ? audio.duration * 1000 : 0);
            let date2 = new Date(Math.floor(totalTime));
            let minute2 = date2.getMinutes();
            let second2 = date2.getSeconds();
            minute2 = formTime(minute2)
            second2 = formTime(second2)

            $('.time-song').textContent = `${minute}:${second} / ${minute2}:${second2}`
            

        };

        // Xử lý khi tua
        seekBar.oninput = function (e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
            // console.log(seekTime);
        };

        next_Btn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        prev_Btn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();


        };

        // Xử lý next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            }
            else {
                next_Btn.click();
            }
        };

        // Xử lý random bật / tắt
        random_Btn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            random_Btn.classList.toggle('active', _this.isRandom);
        };

        // Xử lý lặp lại 1 song
        repeat_Btn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeat_Btn.classList.toggle('active', _this.isRepeat);
        };

        // lắng nghe hành vi click vào playlist
        playList.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            const nodeOption = e.target.closest('.option');
            // closest() trả về element chính nó hoặc trả về thẻ cha của nó
            if (songNode || nodeOption) {
                // console.log(e.target) trả về element đc click vào
                // xử lý khi click vào song
                if (songNode) {
                    // console.log(songNode.getAttribute('data-index'));
                    // console.log(songNode.dataset.index);
                    // do lấy attribute sẽ thành dạng chuỗi nên convert sang Number
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }
                // Xử lý khi click vào option
                if (nodeOption) {

                }

            }
        }

        volumeElement.onchange = function() {
            audio.volume = volumeElement.value / 100
            if(audio.volume === 0) {
                volume.classList.remove('play');
            }else {
                volume.classList.add('play');
            }
            
        }




    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },

    // Active song
    scrollToActiveSong: function () {
        setTimeout(function() {
            $('.song.active').scrollIntoView({
                behavior:'auto',
                block:'center'
            });
        },300);
    },

    // Load song đầu tiên
    loadCurrentSong: function () {
        titleSong.textContent = this.currentSong.name;
        thumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        audio.volume = 0;
    },

    nextSong: function () {
        this.currentIndex++;
        console.log(this.currentIndex);
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    randomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex == this.currentIndex);
        // console.log(newIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();

    },

    start: function () {

        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe/ xử lý các sự kiện (DOM events)
        this.handleEvents();

        // Tải bài hát đầu tiên vào UI
        this.loadCurrentSong();

        // Render danh sách bài hát
        this.render();


        // Hiển thị trạng thái ban đầu của button repeat và random
        repeat_Btn.classList.toggle('active', this.isRepeat);
        random_Btn.classList.toggle('active', this.isRandom);
    }
}

app.start();

