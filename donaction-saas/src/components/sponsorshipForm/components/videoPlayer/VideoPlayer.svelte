<script lang="ts">
  let { src }: { src: string } = $props();

  const loadVideo = (node: HTMLDivElement) => {
    // const video = node.querySelector('#video');
    // const playPauseButton = node.querySelector('#play-pause');
    // const currentTime = node.querySelector('#current-time');
    // const duration = node.querySelector('#duration');
    // const progressBar = node.querySelector('#progress-bar');
    // const volumeButton = node.querySelector('#volume');
    // const fullscreenButton = node.querySelector('#fullscreen');
    //
    // console.log({
    //   video,
    //   playPauseButton,
    //   currentTime,
    //   duration,
    //   progressBar,
    //   volumeButton,
    //   fullscreenButton
    // });
    //
    // // Toggle play/pause
    // playPauseButton.addEventListener('click', () => {
    //   if (video.paused) {
    //     video.play();
    //     playPauseButton.classList.replace('play', 'pause');
    //   } else {
    //     video.pause();
    //     playPauseButton.classList.replace('pause', 'play');
    //   }
    // });
    //
    // // Update time and progress bar
    // video.addEventListener('timeupdate', () => {
    //   const current = Math.floor(video.currentTime);
    //   const total = Math.floor(video.duration);
    //   currentTime.textContent = formatTime(current);
    //   duration.textContent = formatTime(total);
    //   progressBar.value = (video.currentTime / video.duration) * 100;
    // });
    //
    // // Seek video
    // progressBar.addEventListener('input', () => {
    //   video.currentTime = (progressBar.value / 100) * video.duration;
    // });
    //
    // // Format time helper function
    // function formatTime(seconds) {
    //   const mins = Math.floor(seconds / 60);
    //   const secs = Math.floor(seconds % 60);
    //   return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    // }
    //
    // // Fullscreen toggle
    // fullscreenButton.addEventListener('click', () => {
    //   if (!document.fullscreenElement) {
    //     video.requestFullscreen();
    //   } else {
    //     document.exitFullscreen();
    //   }
    // });
  };
</script>

<div use:loadVideo class="video-container">
  <video id="video" autoplay="autoplay" playsinline="playsinline" controls {src}></video>
  <!--  <div class="controls">-->
  <!--    <button id="play-pause" class="play"></button>-->
  <!--    <span id="current-time">0:00</span>-->
  <!--    <input type="range" id="progress-bar" value="0" min="0" max="100" />-->
  <!--    <span id="duration">0:00</span>-->
  <!--    <button id="volume" class="volume"></button>-->
  <!--    <button id="settings" class="settings"></button>-->
  <!--    <button id="fullscreen" class="fullscreen"></button>-->
  <!--  </div>-->
</div>

<style lang="scss">
  @use 'index';
  @use '../../../../styles/main';
</style>
