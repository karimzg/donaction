<script lang="ts">
  import share from '../../assets/icons/share.svg';
  import x from '../../assets/icons/x.svg';
  import copy from '../../assets/icons/copy.svg';
  import { dispatchToast } from '../../components/sponsorshipForm/logic/toaster';
  import { SUBSCRIPTION } from '../../components/sponsorshipForm/logic/useSponsorshipForm.svelte';
  import { sendGaEvent } from '../sendGaEvent';

  let { position } = $props();
  let isOpen = $state(false);

  // Replace with your URL and message
  const urlToShare = encodeURIComponent(window.location.href);
  const message = encodeURIComponent(
    `Découvrez la page web de ${SUBSCRIPTION.klubr?.denomination} !`
  );
  const subject = encodeURIComponent('Klubr');

  // Share links
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${urlToShare}`;
  const twitterShare = `https://twitter.com/intent/tweet?url=${urlToShare}&text=${message}`;
  const whatsappShare = `https://wa.me/?text=${message}%20${urlToShare}`;
  const linkedinShare = `https://www.linkedin.com/sharing/share-offsite/?url=${urlToShare}`;
  const emailShare = `mailto:?subject=${subject}&body=${message}%20${urlToShare}`;

  const controlShare = () => {
    isOpen = !isOpen;
  };

  const copyLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        dispatchToast('Lien copié dans le presse-papiers !', 'SUCCESS');
        sendGaEvent({
          category: 'Social Share',
          label: `Copied link: ${linkToShare}`
        });
      })
      .catch((err) => {
        console.error('Failed to copy the link: ', err);
      });
  };

  const shareFn = (destination: string, linkToShare: string) => {
    sendGaEvent({
      category: 'Social Share',
      label: `Opened share modal in ${destination}, url to share: ${linkToShare}`
    });
  };
</script>

<div class="share-container">
  <button class="secondary-btn flex gap-1-2 items-center" onclick={controlShare}
    ><span>Partager</span>
    <img alt="partager" src={share} width="20" />
  </button>
  {#if isOpen}
    <div class="share-modal flex flex-col gap-1-2">
      <img onclick={controlShare} width="20" class="close" src={x} alt="close" />

      <div class="flex items-center shareBtns" style="gap: 4px">
        <a target="_blank" href={facebookShare} onclick={() => shareFn('FACEBOOK', facebookShare)}>
          <svg viewBox="0 0 64 64" width="32" height="32">
            <circle cx="32" cy="32" r="32" fill="#0965FE"></circle>
            <path
              d="M34.1,47V33.3h4.6l0.7-5.3h-5.3v-3.4c0-1.5,0.4-2.6,2.6-2.6l2.8,0v-4.8c-0.5-0.1-2.2-0.2-4.1-0.2 c-4.1,0-6.9,2.5-6.9,7V28H24v5.3h4.6V47H34.1z"
              fill="white"
            ></path>
          </svg>
        </a>
        <a target="_blank" href={twitterShare} onclick={() => shareFn('TWITTER', twitterShare)}>
          <svg viewBox="0 0 64 64" width="32" height="32">
            <circle cx="32" cy="32" r="32" fill="#000000"></circle>
            <path
              d="M 41.116 18.375 h 4.962 l -10.8405 12.39 l 12.753 16.86 H 38.005 l -7.821 -10.2255 L 21.235 47.625 H 16.27 l 11.595 -13.2525 L 15.631 18.375 H 25.87 l 7.0695 9.3465 z m -1.7415 26.28 h 2.7495 L 24.376 21.189 H 21.4255 z"
              fill="white"
            ></path>
          </svg>
        </a>
        <a target="_blank" href={whatsappShare} onclick={() => shareFn('WHATSAPP', whatsappShare)}>
          <svg viewBox="0 0 64 64" width="32" height="32">
            <circle cx="32" cy="32" r="32" fill="#25D366"></circle>
            <path
              d="m42.32286,33.93287c-0.5178,-0.2589 -3.04726,-1.49644 -3.52105,-1.66732c-0.4712,-0.17346 -0.81554,-0.2589 -1.15987,0.2589c-0.34175,0.51004 -1.33075,1.66474 -1.63108,2.00648c-0.30032,0.33658 -0.60064,0.36247 -1.11327,0.12945c-0.5178,-0.2589 -2.17994,-0.80259 -4.14759,-2.56312c-1.53269,-1.37217 -2.56312,-3.05503 -2.86603,-3.57283c-0.30033,-0.5178 -0.03366,-0.80259 0.22524,-1.06149c0.23301,-0.23301 0.5178,-0.59547 0.7767,-0.90616c0.25372,-0.31068 0.33657,-0.5178 0.51262,-0.85437c0.17088,-0.36246 0.08544,-0.64725 -0.04402,-0.90615c-0.12945,-0.2589 -1.15987,-2.79613 -1.58964,-3.80584c-0.41424,-1.00971 -0.84142,-0.88027 -1.15987,-0.88027c-0.29773,-0.02588 -0.64208,-0.02588 -0.98382,-0.02588c-0.34693,0 -0.90616,0.12945 -1.37736,0.62136c-0.4712,0.5178 -1.80194,1.76053 -1.80194,4.27186c0,2.51134 1.84596,4.945 2.10227,5.30747c0.2589,0.33657 3.63497,5.51458 8.80262,7.74113c1.23237,0.5178 2.1903,0.82848 2.94111,1.08738c1.23237,0.38836 2.35599,0.33657 3.24402,0.20712c0.99159,-0.15534 3.04985,-1.24272 3.47963,-2.45956c0.44013,-1.21683 0.44013,-2.22654 0.31068,-2.45955c-0.12945,-0.23301 -0.46601,-0.36247 -0.98382,-0.59548m-9.40068,12.84407l-0.02589,0c-3.05503,0 -6.08417,-0.82849 -8.72495,-2.38189l-0.62136,-0.37023l-6.47252,1.68286l1.73463,-6.29129l-0.41424,-0.64725c-1.70875,-2.71846 -2.6149,-5.85116 -2.6149,-9.07706c0,-9.39809 7.68934,-17.06155 17.15993,-17.06155c4.58253,0 8.88029,1.78642 12.11655,5.02268c3.23625,3.21036 5.02267,7.50812 5.02267,12.06476c-0.0078,9.3981 -7.69712,17.06155 -17.14699,17.06155m14.58906,-31.58846c-3.93529,-3.80584 -9.1133,-5.95471 -14.62789,-5.95471c-11.36055,0 -20.60848,9.2065 -20.61625,20.52564c0,3.61684 0.94757,7.14565 2.75211,10.26282l-2.92557,10.63564l10.93337,-2.85309c3.0136,1.63108 6.4052,2.4958 9.85634,2.49839l0.01037,0c11.36574,0 20.61884,-9.2091 20.62403,-20.53082c0,-5.48093 -2.14111,-10.64081 -6.03239,-14.51915"
              fill="white"
            ></path>
          </svg>
        </a>
        <a target="_blank" href={linkedinShare} onclick={() => shareFn('LINKEDIN', linkedinShare)}>
          <svg viewBox="0 0 64 64" width="32" height="32">
            <circle cx="32" cy="32" r="32" fill="#0077B5"></circle>
            <path
              d="M20.4,44h5.4V26.6h-5.4V44z M23.1,18c-1.7,0-3.1,1.4-3.1,3.1c0,1.7,1.4,3.1,3.1,3.1 c1.7,0,3.1-1.4,3.1-3.1C26.2,19.4,24.8,18,23.1,18z M39.5,26.2c-2.6,0-4.4,1.4-5.1,2.8h-0.1v-2.4h-5.2V44h5.4v-8.6 c0-2.3,0.4-4.5,3.2-4.5c2.8,0,2.8,2.6,2.8,4.6V44H46v-9.5C46,29.8,45,26.2,39.5,26.2z"
              fill="white"
            ></path>
          </svg>
        </a>
        <a target="_blank" href={emailShare} onclick={() => shareFn('EMAIL', emailShare)}>
          <svg viewBox="0 0 64 64" width="32" height="32">
            <circle cx="32" cy="32" r="32" fill="#7f7f7f"></circle>
            <path
              d="M17,22v20h30V22H17z M41.1,25L32,32.1L22.9,25H41.1z M20,39V26.6l12,9.3l12-9.3V39H20z"
              fill="white"
            ></path>
          </svg>
        </a>
      </div>

      <div class="flex items-center gap-1-2 linkContainer">
        <p>{window.location.href}</p>
        <img width="32" src={copy} alt="copier" onclick={copyLink} />
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  @use '../../styles/main';
  @use 'index';
</style>
