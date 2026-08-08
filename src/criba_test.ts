// Tests de paridad con kolmo.py (verificado exhaustivamente) y sanidad general.
import { assert, assertEquals } from "jsr:@std/assert";
import { collapse, copenhague, enumerate, everett } from "./criba.ts";
import { type Example, run, show, size } from "./peanito.ts";

const ex = (f: (n: number) => number, xs = [0, 1, 2, 3, 4, 5]): Example[] =>
  xs.map((x) => [x, f(x)] as const);

Deno.test("collapse: cardinalidades exactas (paridad kolmo)", () => {
  const count = (d: number) => [...collapse(enumerate(false, d))].length;
  assertEquals(count(0), 2);
  assertEquals(count(1), 13);
  assertEquals(count(2), 240);
  assertEquals(count(3), 59291);
});

Deno.test("collapse: sin duplicados por profundidad", () => {
  for (let d = 0; d <= 3; d++) {
    const all = [...collapse(enumerate(false, d))].map(show);
    assertEquals(new Set(all).size, all.length);
  }
});

Deno.test("run: casos de mano", () => {
  const double = {
    t: "Mat" as const,
    zero: { t: "Zero" as const },
    succ: { t: "Suc" as const, body: { t: "Suc" as const, body: { t: "Rec" as const } } },
  };
  for (let n = 0; n <= 40; n++) assertEquals(run(double, n), 2 * n);
});

Deno.test("copenhague: encuentra los objetivos clásicos, mínimos", () => {
  const cases: [string, (n: number) => number, string][] = [
    ["identidad", (n) => n, "*"],
    ["const 0", () => 0, "0"],
    ["n+1", (n) => n + 1, "(S *)"],
    ["doble", (n) => 2 * n, "{0:* | S:(S (S @))}"],
    ["pred", (n) => Math.max(n - 1, 0), "{0:* | S:*}"],
    ["mitad", (n) => Math.floor(n / 2), "{0:* | S:{0:@ | S:(S @)}}"],
  ];
  for (const [name, f, expected] of cases) {
    const r = copenhague(ex(f));
    assert(r.prog !== null, `${name}: no encontrado`);
    assertEquals(show(r.prog), expected, name);
  }
});

Deno.test("copenhague: entrada grande no rompe el fuel (bug de kolmo original)", () => {
  const r = copenhague([[0, 0], [1, 2], [20, 40]]);
  assert(r.prog !== null);
  assertEquals(show(r.prog), "{0:* | S:(S (S @))}");
});

Deno.test("copenhague: ejemplos inconsistentes → null sin colgarse", () => {
  const r = copenhague([[1, 2], [1, 3]], 5000);
  assertEquals(r.prog, null);
});

Deno.test("everett: coincide con copenhague donde ambos llegan", () => {
  for (
    const f of [
      (n: number) => n,
      () => 0,
      (n: number) => n + 1,
      (n: number) => 2 * n,
      (n: number) => n % 2,
    ]
  ) {
    const c = copenhague(ex(f));
    const e = everett(ex(f), 4, 3_000_000);
    assert(c.prog && e.prog);
    assertEquals(size(e.prog), size(c.prog));
    for (let x = 0; x <= 8; x++) assertEquals(run(e.prog, x), run(c.prog, x));
  }
});

Deno.test("everett: llega donde Copenhague se rinde (triple, prof. 4)", () => {
  const e = everett(ex((n) => 3 * n), 5, 10_000_000);
  assert(e.prog !== null);
  assertEquals(show(e.prog), "{0:* | S:(S (S (S @)))}");
  assert(e.stats.provenMinimal);
  for (let x = 0; x <= 12; x++) assertEquals(run(e.prog, x, 100_000), 3 * x);
});

Deno.test("everett: const 4 y n+5 (imposibles para Copenhague), mínimos probados", () => {
  const c4 = everett(ex(() => 4, [0, 1, 3]), 5, 5_000_000);
  assert(c4.prog && c4.stats.provenMinimal);
  assertEquals(size(c4.prog), 5);
  const n5 = everett(ex((n) => n + 5, [0, 1, 2]), 6, 10_000_000);
  assert(n5.prog && n5.stats.provenMinimal);
  assertEquals(size(n5.prog), 6);
});

Deno.test("everett: mod 3 aparece con presupuesto amplio (regresión del minador corto)", () => {
  const e = everett(ex((n) => n % 3, [0, 1, 2, 3, 4, 5, 6]), 5, 50_000_000);
  assert(e.prog !== null);
  for (let x = 0; x <= 10; x++) assertEquals(run(e.prog, x, 100_000), x % 3);
});

Deno.test("everett: lo inexpresable falla honestamente", () => {
  const e = everett(ex((n) => n * n), 4, 3_000_000);
  assertEquals(e.prog, null);
});
