import { computed, onMounted, onUnmounted, readonly, ref } from 'vue';
import { isTauri } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

export type DesktopPlatform = 'windows' | 'macos' | 'linux' | 'web';

function detectDesktopPlatform(): DesktopPlatform {
  if (typeof navigator === 'undefined') return 'web';

  const platformName = `${navigator.platform ?? ''} ${navigator.userAgent}`.toLowerCase();
  if (platformName.includes('mac')) return 'macos';
  if (platformName.includes('win')) return 'windows';
  if (platformName.includes('linux')) return 'linux';
  return 'web';
}

const platform = detectDesktopPlatform();
const nativeRuntime = isTauri();

export function useDesktopWindow() {
  const isMaximized = ref(false);
  const isFullscreen = ref(false);
  let unlistenResize: (() => void) | null = null;

  const usesCustomControls = computed(
    () => nativeRuntime && (platform === 'windows' || platform === 'linux'),
  );
  const usesMacOverlay = computed(() => nativeRuntime && platform === 'macos');
  const showWindowControls = computed(() => usesCustomControls.value && !isFullscreen.value);

  async function syncWindowState() {
    if (!nativeRuntime) return;
    const appWindow = getCurrentWindow();
    const [maximized, fullscreen] = await Promise.all([
      appWindow.isMaximized(),
      appWindow.isFullscreen(),
    ]);
    isMaximized.value = maximized;
    isFullscreen.value = fullscreen;
  }

  async function minimize() {
    if (nativeRuntime) await getCurrentWindow().minimize();
  }

  async function toggleMaximize() {
    if (!nativeRuntime) return;
    await getCurrentWindow().toggleMaximize();
    await syncWindowState();
  }

  async function close() {
    if (nativeRuntime) await getCurrentWindow().close();
  }

  onMounted(async () => {
    if (!nativeRuntime) return;
    await syncWindowState();
    unlistenResize = await getCurrentWindow().onResized(() => {
      void syncWindowState();
    });
  });

  onUnmounted(() => {
    unlistenResize?.();
    unlistenResize = null;
  });

  return {
    platform,
    isMaximized: readonly(isMaximized),
    isFullscreen: readonly(isFullscreen),
    usesCustomControls,
    usesMacOverlay,
    showWindowControls,
    minimize,
    toggleMaximize,
    close,
  };
}
