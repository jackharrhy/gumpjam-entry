import kaboom from "kaboom";
import crtFragShader from "./shaders/crt.frag?raw";
import invertOverTimeFragShader from "./shaders/invert-over-time.frag?raw";

const SPEED = 160;
const ENEMY_SPEED = SPEED * 0.5;

if (import.meta.hot) {
  import.meta.hot.invalidate();
}

export const initGame = () => {
  const {
    loadSprite: kaboomLoadSprite,
    loadShader,
    add,
    loop,
    sprite,
    pos,
    rotate,
    anchor,
    center,
    area,
    destroy,
    addKaboom,
    onUpdate,
    onKeyDown,
    onKeyRelease,
    camPos,
    make,
    usePostEffect,
    shader,
    time,
    timer,
    move,
    circle,
    color,
    vec2,
    deg2rad,
    wave,
    z,
  } = kaboom({
    width: 800,
    height: 400,
    letterbox: true,
    background: [0, 0, 0, 0],
  });

  loadShader("crt", undefined, crtFragShader);
  loadShader("invert_over_time", undefined, invertOverTimeFragShader);

  const loadSprite = (name: string, path: string) =>
    kaboomLoadSprite(name, `${import.meta.env.BASE_URL}${path}`);

  loadSprite("boy-body-from-top", "sprites/boy-body-from-top.png");
  loadSprite("boy-tail-from-top", "sprites/boy-tail-from-top.png");
  loadSprite("rat", "sprites/rat.png");

  /*
  usePostEffect("crt", () => ({
    u_flatness: 3,
  }));
  */

  const boy = add([
    "boy",
    sprite("boy-body-from-top", {
      width: 32,
      flipY: true,
    }),
    pos(center()),
    rotate(0),
    anchor("center"),
    area(),
    /*
    shader("invert_over_time", () => ({
      u_time: time(),
    })),
    */
    timer(),
    z(1),
  ]);

  const tail = boy.add([
    "tail",
    sprite("boy-tail-from-top", { width: 32, flipY: true }),
    rotate(0),
    pos(vec2(-2, 20)),
    anchor(vec2(-0.5, -0.5)),
    z(-1),
  ]);

  tail.onUpdate(() => {
    tail.angle = wave(10, 20, time() * 6);
  });

  onKeyDown("left", () => {
    boy.move(-SPEED, 0);
  });

  onKeyDown("right", () => {
    boy.move(SPEED, 0);
  });

  onKeyDown("up", () => {
    boy.move(0, -SPEED);
  });

  onKeyDown("down", () => {
    boy.move(0, SPEED);
  });

  boy.onUpdate(() => {
    camPos(boy.worldPos());
  });

  boy.onCollide("rat", () => {
    destroy(boy);
    addKaboom(boy.pos, { scale: 0.5 });
  });

  const vecFromAngle = (angle: number, scale: number = 1) => {
    const rad = deg2rad(angle);
    return vec2(Math.cos(rad), Math.sin(rad)).scale(scale);
  };

  boy.loop(0.5, () => {
    const vec = vecFromAngle(boy.angle - 90, boy.width);

    add([
      "pew",
      circle(3),
      color(0, 0, 100),
      pos(boy.pos.add(vec)),
      move(vec, SPEED * 1.2),
      area(),
      anchor("center"),
    ]);
  });

  const MIN_SPAWN_AWAY = 32 * 6;
  const MAX_SPAWN_AWAY = MIN_SPAWN_AWAY * 2;
  const range = MAX_SPAWN_AWAY - MIN_SPAWN_AWAY;

  const addRat = () => {
    const distance = MIN_SPAWN_AWAY + range * Math.random();
    const angle = Math.random() * 360;
    const vec = boy.pos.add(vecFromAngle(angle, distance));
    const width = 32;
    const rat = add([
      "rat",
      sprite("rat", {
        width,
      }),
      pos(vec),
      area(),
      rotate(0),
      anchor("center"),
    ]);

    rat.onUpdate(() => {
      if (!boy.exists()) return;
      const dir = boy.pos.sub(rat.pos).unit();
      rat.move(dir.scale(ENEMY_SPEED));
    });

    rat.onCollide("pew", (pew) => {
      destroy(pew);
      destroy(rat);
      addKaboom(rat.pos, { scale: 0.25 });
    });
  };

  loop(2, () => {
    if (boy.exists()) {
      addRat();
    }
  });
};
