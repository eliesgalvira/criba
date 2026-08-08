import { assertEquals } from "jsr:@std/assert";
import { explain } from "./explain.ts";
import { Mat, Rec, Ret, Suc, Zero } from "./peanito.ts";

Deno.test("explain: doble", () => {
  assertEquals(
    explain(Mat(Zero, Suc(Suc(Rec))), "es"),
    `f(n):
  si n = 0:
    devuelve 0
  si n = m + 1:
    devuelve 2 + f(m)`,
  );
});

Deno.test("explain: identidad y constantes", () => {
  assertEquals(explain(Ret, "es"), `f(n):\n  devuelve n`);
  assertEquals(explain(Suc(Suc(Zero)), "es"), `f(n):\n  devuelve 2`);
  assertEquals(explain(Suc(Ret), "en"), `f(n):\n  return 1 + n`);
});

Deno.test("explain: mitad (Mat anidado)", () => {
  assertEquals(
    explain(Mat(Zero, Mat(Rec, Suc(Rec))), "es"),
    `f(n):
  si n = 0:
    devuelve 0
  si n = m + 1:
    si m = 0:
      devuelve f(0)
    si m = k + 1:
      devuelve 1 + f(k)`,
  );
});

Deno.test("explain: Suc alrededor de un Mat (bloque)", () => {
  assertEquals(
    explain(Suc(Mat(Zero, Rec)), "es"),
    `f(n):
  suma 1 a lo que salga de:
    si n = 0:
      devuelve 0
    si n = m + 1:
      devuelve f(m)`,
  );
});
