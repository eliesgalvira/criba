import { assertEquals } from "jsr:@std/assert";
import { explain, explainPatterns } from "./explain.ts";
import { Mat, Rec, Ret, Suc, Zero } from "./peanito.ts";

Deno.test("explain: doble — casos sobre n, sin variables inventadas", () => {
  assertEquals(
    explain(Mat(Zero, Suc(Suc(Rec))), "es"),
    `f(n):
  si n = 0:
    devuelve 0
  si n ≥ 1:
    devuelve 2 + f(n − 1)`,
  );
});

Deno.test("explain: identidad y constantes", () => {
  assertEquals(explain(Ret, "es"), `f(n):\n  devuelve n`);
  assertEquals(explain(Suc(Suc(Zero)), "es"), `f(n):\n  devuelve 2`);
  assertEquals(explain(Suc(Ret), "en"), `f(n):\n  return 1 + n`);
});

Deno.test("explain: mitad — matches anidados aplanados", () => {
  assertEquals(
    explain(Mat(Zero, Mat(Rec, Suc(Rec))), "es"),
    `f(n):
  si n = 0:
    devuelve 0
  si n = 1:
    devuelve f(0)
  si n ≥ 2:
    devuelve 1 + f(n − 2)`,
  );
});

Deno.test("explain: resto ÷3 — la forma que confundía, ahora en llano", () => {
  // {0:0 | S:{0:(S f(0)) | S:{0:(S (S f(0))) | S:@}}} — variante hallada en la web
  const prog = Mat(
    Zero,
    Mat(Suc(Rec), Mat(Suc(Suc(Rec)), Rec)),
  );
  assertEquals(
    explain(prog, "es"),
    `f(n):
  si n = 0:
    devuelve 0
  si n = 1:
    devuelve 1 + f(0)
  si n = 2:
    devuelve 2 + f(0)
  si n ≥ 3:
    devuelve f(n − 3)`,
  );
});

Deno.test("explain: Suc alrededor de un Mat (bloque)", () => {
  assertEquals(
    explain(Suc(Mat(Zero, Rec)), "es"),
    `f(n):
  suma 1 a lo que salga de:
    si n = 0:
      devuelve 0
    si n ≥ 1:
      devuelve f(n − 1)`,
  );
});

Deno.test("explainPatterns: la vista del cribador (doble)", () => {
  assertEquals(
    explainPatterns(Mat(Zero, Suc(Suc(Rec))), "es"),
    `f(n):
  si n = 0:
    devuelve 0
  si n = m + 1:
    devuelve 2 + f(m)`,
  );
});
