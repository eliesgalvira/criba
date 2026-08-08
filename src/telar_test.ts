// Tests de Telar: paridad con el spike verificado (lab/spike-ic.js).
import { assert, assertEquals } from "jsr:@std/assert";
import {
  App,
  fusionDemo,
  Lam,
  naiveCost,
  naiveDemo,
  naiveOversize,
  showIC,
  Telar,
  Var,
} from "./telar.ts";

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

Deno.test("naive: completa con recuento exacto y sin desbordar la pila", () => {
  const ok = naiveDemo(8);
  assert(ok.complete && ok.betas === 768);
  // regresión del stack overflow (~N=13 con sustitución textual recursiva)
  const deep = naiveDemo(14);
  assert(deep.complete && deep.betas === naiveCost(14));
  // la proyección de la UI sale de la implementación medida
  for (const n of [4, 6, 10]) {
    const r = naiveDemo(n);
    assert(r.complete && r.betas === naiveCost(n));
  }
});

Deno.test("naive: al agotar presupuesto conserva el recuento (nada de «0+»)", () => {
  const dnf = naiveDemo(16, 100_000);
  assert(!dnf.complete && dnf.betas >= 100_000 && !dnf.oversize);
});

Deno.test("naive: si el enunciado no cabe, lo dice al instante sin construirlo", () => {
  const t0 = performance.now();
  const r = naiveDemo(29, 6_000_000); // regresión del cuelgue en N=29
  assert(r.oversize === true && !r.complete && r.betas === 0);
  assert(performance.now() - t0 < 50);
  // el predicado que consulta la UI coincide con lo que hace el evaluador
  assert(naiveOversize(23, 10_000_000) && !naiveOversize(22, 10_000_000));
});
