document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const audioElement = new Audio()
    const playBtn = document.getElementById("play")
    const prevBtn = document.getElementById("prev")
    const nextBtn = document.getElementById("next")
    const progressBar = document.getElementById("progress")
    const progressContainer = document.querySelector(".progress-bar")
    const currentTimeEl = document.getElementById("current-time")
    const durationEl = document.getElementById("duration")
    const volumeSlider = document.getElementById("volume")
    const albumArt = document.getElementById("album-art")
    const songTitle = document.getElementById("song-title")
    const songArtist = document.getElementById("song-artist")
    const playlistItems = document.getElementById("playlist-items")
    const visualizer = document.getElementById("visualizer")
  
    // Audio Context for Visualizer
    let audioContext
    let analyser
    let source
    const canvasContext = visualizer.getContext("2d")
    let animationId
  
    // Set canvas size
    visualizer.width = visualizer.offsetWidth
    visualizer.height = visualizer.offsetHeight
  
    // Sample playlist - in a real app, you might load this from an API
    const songs = [
      {
        title: "Devara Thandavam",
        artist: "Anirudh Ravichander",
        src: "Devara Thandavam.mp3",
        cover: "https://i.scdn.co/image/ab67616d00001e025280788ee7502153c9377477",
      },
      {
        title: "Devara: All Hail Tiger",
        artist: "Anirudh Ravichander",
        src: "All Hail The Tiger.mp3",
        cover: "https://i.scdn.co/image/ab67616d00001e02f4920fea00e57158f540baaa",
      },
      {
        title: "Solo Levelling",
        artist: "SawanoHiroyuki & TOMORROW X TOGETHER Band",
        src: "Dfark Solo Levelling Intro.mp3",
        cover: "https://motionbgs.com/media/5261/solo-leveling-arise.jpg",
      },
      {
        title: "Devara: Ayudha Pooja",
        artist: "Kala Bhairava",
        src:"Ayudha Pooja.mp3",
        cover: "https://i.scdn.co/image/ab67616d00001e02ace943da67db014bbcbbf1c1",
      },
    ]
  
    // Current song index
    let songIndex = 0
  
    // Initialize player
    function initPlayer() {
      // Load first song
      loadSong(songs[songIndex])
  
      // Create playlist items
      renderPlaylist()
  
      // Set initial volume
      audioElement.volume = volumeSlider.value
  
      // Setup audio context for visualizer when user interacts
      playBtn.addEventListener("click", () => {
        if (!audioContext) {
          setupAudioContext()
        }
        togglePlay()
      })
    }
  
    // Setup Audio Context for visualizer
    function setupAudioContext() {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      analyser = audioContext.createAnalyser()
      source = audioContext.createMediaElementSource(audioElement)
  
      source.connect(analyser)
      analyser.connect(audioContext.destination)
  
      analyser.fftSize = 256
  
      // Start visualizer
      visualize()
    }
  
    // Render the playlist
    function renderPlaylist() {
      playlistItems.innerHTML = ""
      songs.forEach((song, index) => {
        const li = document.createElement("li")
        li.textContent = `${song.title} - ${song.artist}`
        li.dataset.index = index
  
        if (index === songIndex) {
          li.classList.add("active")
        }
  
        li.addEventListener("click", () => {
          songIndex = Number.parseInt(li.dataset.index)
          loadSong(songs[songIndex])
          if (!audioContext) {
            setupAudioContext()
          }
          playAudio()
        })
  
        playlistItems.appendChild(li)
      })
    }
  
    // Load song details
    function loadSong(song) {
    songTitle.textContent = song.title
    songArtist.textContent = song.artist
    albumArt.src = song.cover
    audioElement.src = song.src

    // Set background image with blur effect
    const backgroundBlur = document.getElementById('background-blur')
    backgroundBlur.style.backgroundImage = `url(${song.cover})`

    // Update active playlist item
    document.querySelectorAll("#playlist-items li").forEach((item, index) => {
    if (index === songIndex) {
    item.classList.add("active")
    } else {
    item.classList.remove("active")
    }
    })
    }
  
    // Play/Pause toggle
    function togglePlay() {
      if (audioElement.paused) {
        playAudio()
      } else {
        pauseAudio()
      }
    }
  
    // Play audio
    function playAudio() {
      audioElement.play()
      playBtn.innerHTML = '<i class="fas fa-pause"></i>'
      document.querySelector(".album-cover").classList.add("playing")
    }
  
    // Pause audio
    function pauseAudio() {
      audioElement.pause()
      playBtn.innerHTML = '<i class="fas fa-play"></i>'
      document.querySelector(".album-cover").classList.remove("playing")
    }
  
    // Previous song
    function prevSong() {
      songIndex--
      if (songIndex < 0) {
        songIndex = songs.length - 1
      }
      loadSong(songs[songIndex])
      playAudio()
    }
  
    // Next song
    function nextSong() {
      songIndex++
      if (songIndex > songs.length - 1) {
        songIndex = 0
      }
      loadSong(songs[songIndex])
      playAudio()
    }
  
    // Update progress bar
    function updateProgress(e) {
      const { duration, currentTime } = e.target
      const progressPercent = (currentTime / duration) * 100
      progressBar.style.width = `${progressPercent}%`
  
      // Update time displays
      currentTimeEl.textContent = formatTime(currentTime)
      if (duration) {
        durationEl.textContent = formatTime(duration)
      }
    }
  
    // Format time to MM:SS
    function formatTime(seconds) {
      const min = Math.floor(seconds / 60)
      const sec = Math.floor(seconds % 60)
      return `${min}:${sec < 10 ? "0" + sec : sec}`
    }
  
    // Set progress bar on click
    function setProgress(e) {
      const width = this.clientWidth
      const clickX = e.offsetX
      const duration = audioElement.duration
      audioElement.currentTime = (clickX / width) * duration
    }
  
    // Visualizer function
    function visualize() {
      visualizer.width = visualizer.offsetWidth
      visualizer.height = visualizer.offsetHeight
  
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
  
      canvasContext.clearRect(0, 0, visualizer.width, visualizer.height)
  
      function renderFrame() {
        animationId = requestAnimationFrame(renderFrame)
  
        analyser.getByteFrequencyData(dataArray)
  
        canvasContext.fillStyle = "rgb(18, 18, 18)"
        canvasContext.fillRect(0, 0, visualizer.width, visualizer.height)
  
        const barWidth = (visualizer.width / bufferLength) * 2.5
        let x = 0
  
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * visualizer.height
  
          // Create gradient for bars
          const gradient = canvasContext.createLinearGradient(0, visualizer.height, 0, 0)
          gradient.addColorStop(0, "#1db954")
          gradient.addColorStop(1, "#1ed760")
  
          canvasContext.fillStyle = gradient
          canvasContext.fillRect(x, visualizer.height - barHeight, barWidth, barHeight)
  
          x += barWidth + 1
        }
      }
      renderFrame()
    }
  
    // Event Listeners
    prevBtn.addEventListener("click", prevSong)
    nextBtn.addEventListener("click", nextSong)
    audioElement.addEventListener("timeupdate", updateProgress)
    progressContainer.addEventListener("click", setProgress)
  
    // When song ends, play next song
    audioElement.addEventListener("ended", nextSong)
  
    // Volume control
    volumeSlider.addEventListener("input", function () {
      audioElement.volume = this.value
    })
  
    // Handle window resize for visualizer
    window.addEventListener("resize", () => {
      if (visualizer) {
        visualizer.width = visualizer.offsetWidth
        visualizer.height = visualizer.offsetHeight
      }
    })
    // Initialize the player
    initPlayer()
  })