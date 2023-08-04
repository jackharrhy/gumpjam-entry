import kaboom from "kaboom";
import { playing, setPlaying } from "../GameCanvas";
import crtFragShader from "./shaders/crt.frag?raw";
import invertOverTimeFragShader from "./shaders/invert-over-time.frag?raw";

const SPEED = 320;

export const initGame = (canvas: HTMLCanvasElement) => {
  const {
    loadSprite: kaboomLoadSprite,
    loadShader,
    add,
    sprite,
    pos,
    rotate,
    anchor,
    center,
    onUpdate,
    usePostEffect,
    shader,
    time,
  } = kaboom({
    canvas,
    background: [255, 255, 255],
  });

  loadShader("crt", undefined, crtFragShader);
  loadShader("invert_over_time", undefined, invertOverTimeFragShader);

  const loadSprite = (name: string, path: string) =>
    kaboomLoadSprite(name, `${import.meta.env.BASE_URL}${path}`);

  loadSprite("rat", "sprites/rat.png");

  usePostEffect("crt", () => ({
    u_flatness: 3,
  }));

  const rat = add([
    sprite("rat", {
      width: 128,
    }),
    pos(center()),
    rotate(0),
    anchor("center"),
    shader("invert_over_time", () => ({
      u_time: time(),
    })),
  ]);

  const keys = {
    ArrowLeft: () => {
      rat.move(-SPEED, 0);
    },
    ArrowRight: () => {
      rat.move(SPEED, 0);
    },
    ArrowUp: () => {
      rat.move(0, -SPEED);
    },
    ArrowDown: () => {
      rat.move(0, SPEED);
    },
    Escape: () => {
      setPlaying(false);
    },
  } as const;

  const isKeyPressed: Record<string, boolean> = Object.keys(keys).reduce(
    (acc, key) => ({ ...acc, [key]: false }),
    {}
  );

  onUpdate(() => {
    Object.keys(keys).forEach((key) => {
      if (!isKeyPressed[key]) return;
      keys[key as keyof typeof keys]();
    });
  });

  canvas.onkeydown = (e) => {
    if (!playing()) return;
    if (isKeyPressed[e.key]) return;
    isKeyPressed[e.key] = true;
  };

  canvas.onkeyup = (e) => {
    if (!playing()) return;
    if (!isKeyPressed[e.key]) return;
    isKeyPressed[e.key] = false;
  };
};
