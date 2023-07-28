import { GameCanvas, setPlaying } from "./GameCanvas";

export const App = () => {
  let canvas: HTMLCanvasElement | undefined;

  return (
    <>
      <GameCanvas canvas={canvas} />
      <div class="h-full bg-gray-900/50 p-8">
        <header class="flex flex-col gap-4 m-auto w-64 bg-gray-100 p-4">
          <p>gumpjam entry</p>
          <button onClick={() => setPlaying(true)} class="bg-gray-300">
            start
          </button>
        </header>
      </div>
    </>
  );
};
