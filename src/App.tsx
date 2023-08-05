import { onMount } from "solid-js";
import { initGame } from "./game/main";

export const App = () => {
  onMount(async () => {
    initGame();
  });
  return null;
};
