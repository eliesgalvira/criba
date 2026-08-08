// Tests de Telar: paridad con el spike verificado (lab/spike-ic.js).
import { assert, assertEquals } from "jsr:@std/assert";
import { App, fusionDemo, Lam, naiveDemo, showIC, Telar, Var } from "./telar.ts";

Deno.test("β básica: (λx.λt.(t x) λy.y) → λt.(t λy.y)", () => {
  const m = new Telar();
  const [x, t, y] = [m.fresh(), m.fresh(), m.fresh()];
  const term = App(Lam(x, Lam(t, App(Var(t), Var(x)))), Lam(y, Var(y)));
  assertEquals(showIC(m.normal(term)), "λa.(a λb.b)");
});

Deno.test("fusión: not^(2^N) correcto y en O(N) interacciones (paridad spike)", () => {
  // paridad exacta con el spike verificado: N=16 → 196, N=30 → 364
  const r16 = fusionDemo(16);
  assertEquals(r16.result, "true");
  assertEquals(r16.interactions, 196);
  const r30 = fusionDemo(30);
  assertEquals(r30.result, "true");
  assertEquals(r30.interactions, 364);
  // crecimiento lineal, no exponencial
  const r100 = fusionDemo(100);
  assertEquals(r100.result, "true");
  assert(r100.interactions < 2000);
});

Deno.test("naive: el mismo cómputo agota el presupuesto ya en 2^16", () => {
  const ok = naiveDemo(8, 2_000_000);
  assert(ok !== null && ok.betas === 768);
  assertEquals(naiveDemo(16, 100_000), null);
});
