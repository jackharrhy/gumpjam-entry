import { createEffect, createSignal, onMount } from "solid-js";
import { initGame } from "./game/main";

export const [playing, setPlaying] = createSignal(false);

export const GameCanvas = ({
  canvas,
}: {
  canvas: HTMLCanvasElement | undefined;
}) => {
  onMount(async () => {
    if (!canvas) return;
    initGame(canvas);
    canvas.blur();
  });

  createEffect(() => {
    console.log({ playing: playing() });
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
