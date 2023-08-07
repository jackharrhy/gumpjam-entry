import kaboom, { TweenController } from "kaboom";
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
    isKeyDown,
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
    wave,
    z,
    tween,
    easings,
    deg2rad,
    rad2deg,
  } = kaboom({
    width: 800,
    height: 400,
    letterbox: true,
    background: [255, 255, 255, 255],
  });

  loadShader("crt", undefined, crtFragShader);
  loadShader("invert_over_time", undefined, invertOverTimeFragShader);

  const loadSprite = (name: string, path: string) =>
    kaboomLoadSprite(name, `${import.meta.env.BASE_URL}${path}`);

  loadSprite("boy-body-from-top", "sprites/boy-body-from-top.png");
  loadSprite("boy-tail-from-top", "sprites/boy-tail-from-top.png");
  loadSprite("rat-body-from-top", "sprites/rat-body-from-top.png");
  loadSprite("rat-tail-from-top", "sprites/rat-tail-from-top.png");

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

  type Vec2 = ReturnType<typeof vec2>;

  let curBoyTween: TweenController | null = null;
  let curBoyTweenTarget: number | null = null;
  let lastKnownBoyPos = boy.pos;

  boy.onUpdate(() => {
    let vec = vec2(0, 0);

    if (isKeyDown("left")) {
      vec = vec.add(vec2(-1, 0));
    }

    if (isKeyDown("right")) {
      vec = vec.add(vec2(1, 0));
    }

    if (isKeyDown("up")) {
      vec = vec.add(vec2(0, -1));
    }

    if (isKeyDown("down")) {
      vec = vec.add(vec2(0, 1));
    }

    if (vec.len() > 0) {
      const vecToAngle = (vec: Vec2) => Math.atan2(vec.y, vec.x);
      let boyLooking = rad2deg(vecToAngle(vec)) + 90;

      const changeInAngle = boy.angle - boyLooking;
      if (changeInAngle > 180) {
        boyLooking += changeInAngle > 0 ? 360 : -360;
      }

      if (curBoyTweenTarget !== boyLooking) {
        if (curBoyTween) {
          curBoyTween.cancel();
        }
        curBoyTween = tween(
          boy.angle,
          boyLooking,
          0.4,
          (val) => (boy.angle = val),
          easings.easeOutQuad
        );
        curBoyTweenTarget = boyLooking;
      }
    }

    boy.move(vec.scale(SPEED));
    lastKnownBoyPos = boy.pos;
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

    const pew = add([
      "pew",
      circle(3),
      color(0, 0, 100),
      pos(boy.pos.add(vec)),
      move(vec, SPEED * 1.2),
      area(),
      anchor("center"),
      timer(),
    ]);

    pew.wait(10, () => {
      destroy(pew);
    });
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
      sprite("rat-body-from-top", {
        width,
        flipY: true,
      }),
      pos(vec),
      area(),
      rotate(0),
      anchor("center"),
      z(-1),
    ]);

    const tail = rat.add([
      "tail",
      sprite("rat-tail-from-top", { width: 32, flipY: true }),
      rotate(0),
      pos(vec2(0, 20)),
      anchor(vec2(-0.8, -1)),
      z(-1),
    ]);

    tail.onUpdate(() => {
      tail.angle = wave(-10, 20, time() * 12);
    });

    rat.onUpdate(() => {
      const wiggle = wave(-5, 5, time() * 8 + 16);
      let angle = wiggle;

      const dir = lastKnownBoyPos.sub(rat.pos).unit();
      if (boy.exists()) {
        rat.move(dir.scale(ENEMY_SPEED));
      }
      angle += rad2deg(Math.atan2(dir.y, dir.x));

      rat.angle = angle + 90;
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
