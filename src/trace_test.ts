import { assert, assertEquals } from "jsr:@std/assert";
import { pickTraceInput, trace } from "./trace.ts";
import { Mat, Rec, Ret, Suc, Zero } from "./peanito.ts";

const double = Mat(Zero, Suc(Suc(Rec)));

Deno.test("trace: el doble con n=3, paso a paso", () => {
  const tr = trace(double, 3)!;
  assertEquals(tr.steps, [
    { v: 3, add: 2, next: 2 },
    { v: 2, add: 2, next: 1 },
    { v: 1, add: 2, next: 0 },
    { v: 0, add: 0, next: null, base: 0 },
  ]);
  assertEquals(tr.total, 6);
});

Deno.test("trace: identidad termina en una pasada", () => {
  const tr = trace(Ret, 5)!;
  assertEquals(tr.steps, [{ v: 5, add: 0, next: null, base: 5 }]);
  assertEquals(tr.total, 5);
});

Deno.test("pickTraceInput: elige una traza con chicha", () => {
  const n = pickTraceInput(double, [4, 5, 6]);
  assert(n !== null && trace(double, n)!.steps.length >= 2);
});
