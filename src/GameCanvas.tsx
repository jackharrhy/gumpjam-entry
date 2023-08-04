import { createEffect, createSignal, onMount } from "solid-js";
import { initGame } from "./game/main";

export const [playing, setPlaying] = createSignal(true);

export const GameCanvas = ({
  canvas,
}: {
  canvas: HTMLCanvasElement | undefined;
}) => {
  onMount(async () => {
    if (!canvas) return;
    initGame(canvas);
    if (!playing()) {
      canvas.blur();
    }

    const observer = new ResizeObserver(() => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    });
    observer.observe(canvas);
  });

  createEffect(() => {
    if (!canvas) return;
    if (playing()) {
      canvas.focus();
    } else {
      canvas.blur();
    }
  });

  return (
    <canvas
      ref={canvas}
      class="absolute top-0 left-0 w-full h-full"
      classList={{
        "-z-10": !playing(),
        "z-10": playing(),
      }}
    />
  );
};
