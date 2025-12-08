<script lang="ts">
  import { onMount } from 'svelte';
  import lottie, { AnimationItem } from 'lottie-web';

  let {
    segment,
    animation,
    goToFrame,
    isControlled
  }: {
    animation: JSON;
    isControlled: boolean | undefined;
    goToFrame: { value: number; cap: number; override?: boolean } | undefined;
    segment:
      | {
          start_frame: number;
          end_frame: number;
        }
      | undefined;
  } = $props();

  let animationContainer = HTMLDivElement;
  let animationInstance = AnimationItem;
  let totalFrameCount = $state(0);

  onMount(() => {
    if (animationContainer) {
      animationInstance = lottie.loadAnimation({
        container: animationContainer,
        renderer: 'svg',
        loop: !isControlled,
        autoplay: !isControlled,
        animationData: animation
      });

      animationInstance?.addEventListener('DOMLoaded', () => {
        totalFrameCount = animationInstance?.totalFrames || 0;
      });

      if (animationInstance && isControlled && goToFrame && segment) {
        // animationInstance?.addEventListener('enterFrame', (event) => {
        //   const currentFrame = event.currentTime;
        //   console.table({
        //     CurrentFrame: currentFrame,
        //     GoToFrameValue: goToFrame?.value,
        //     GoToFrameCap: goToFrame?.cap,
        //     percentGoToFrame:
        //       (segment.end_frame - segment.start_frame) * (goToFrame?.value / goToFrame?.cap),
        //     StartFrame: segment?.start_frame,
        //     EndFrame: segment?.end_frame,
        //     TotalFrameCount: animationInstance?.totalFrames
        //   });
        // });
      }
    }
  });

  let timeout: number = NaN;

  const debounce = () => {
    if (!isNaN(timeout)) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      animationInstance?.playSegments([segment?.start_frame, segment?.end_frame], true);

      clearTimeout(timeout);
    }, 300);
  };

  $effect(() => {
    if (totalFrameCount && animationInstance && isControlled && goToFrame && segment) {
      if (goToFrame?.override) {
        debounce();
      } else {
        clearTimeout(timeout);
        animationInstance?.setSegment(segment?.start_frame, segment?.end_frame);
        const frame =
          (segment.end_frame - segment.start_frame) * (goToFrame?.value / goToFrame?.cap);
        animationInstance?.goToAndStop(frame, true);
      }
    }
  });
</script>

<div class="lottieAnimationContainer" bind:this={animationContainer}></div>

<style>
  .lottieAnimationContainer {
    width: 100%;
  }
</style>
