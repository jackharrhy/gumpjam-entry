import kaboom from "kaboom";
import { setPlaying } from "../GameCanvas";

const SPEED = 320;

export const initGame = (canvas: HTMLCanvasElement) => {
  const {
    loadSprite: kaboomLoadSprite,
    add,
    sprite,
    pos,
    rotate,
    anchor,
    center,
    onKeyDown,
    onKeyPress,
    isFocused,
  } = kaboom({
    canvas,
  });

  const loadSprite = (name: string, path: string) =>
    kaboomLoadSprite(name, `${import.meta.env.BASE_URL}${path}`);

  loadSprite("rat", "sprites/rat.png");

  const rat = add([
    sprite("rat", {
      width: 128,
    }),
    pos(center()),
    rotate(0),
    anchor("center"),
  ]);

  console.log({ rat });

  onKeyDown("left", () => {
    if (!isFocused()) return;
    rat.move(-SPEED, 0);
  });

  onKeyDown("right", () => {
    if (!isFocused()) return;
    rat.move(SPEED, 0);
  });

  onKeyDown("up", () => {
    if (!isFocused()) return;
    rat.move(0, -SPEED);
  });

  onKeyDown("down", () => {
    if (!isFocused()) return;
    rat.move(0, SPEED);
  });

  onKeyPress("escape", () => {
    if (!isFocused()) return;
    setPlaying(false);
  });
};
