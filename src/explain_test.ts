import { assertEquals } from "jsr:@std/assert";
import { explain, explainLoop, explainPatterns } from "./explain.ts";
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

Deno.test("explainLoop: el doble, sin recursión", () => {
  assertEquals(
    explainLoop(Mat(Zero, Suc(Suc(Rec))), "es"),
    `empieza: total = 0, y toma tu n
repite (el total no se borra entre vueltas):
  si n = 0 → párate
  si n ≥ 1 → suma 2 al total y vuelve arriba con n = n − 1
al pararte, el resultado es el total`,
  );
});

Deno.test("explainLoop: resto ÷3, sin recursión", () => {
  const prog = Mat(Zero, Mat(Suc(Rec), Mat(Suc(Suc(Rec)), Rec)));
  assertEquals(
    explainLoop(prog, "es"),
    `empieza: total = 0, y toma tu n
repite (el total no se borra entre vueltas):
  si n = 0 → párate
  si n = 1 → suma 1 al total y vuelve arriba con n = 0
  si n = 2 → suma 2 al total y vuelve arriba con n = 0
  si n ≥ 3 → vuelve arriba con n = n − 3
al pararte, el resultado es el total`,
  );
});

Deno.test("explainLoop: 2n+1, match dentro de un sucesor (regresión «hoja inesperada»)", () => {
  // el mínimo para f(0)=1, f(1)=3, f(3)=7 es (S {0:* | S:(S @)}): el Suc
  // exterior reparte «suma 1» a todos los casos como acarreo
  const prog = Suc(Mat(Ret, Suc(Rec)));
  assertEquals(
    explainLoop(prog, "es"),
    `empieza: total = 0, y toma tu n
repite (el total no se borra entre vueltas):
  si n = 0 → suma 1 al total y párate
  si n ≥ 1 → suma 2 al total y vuelve arriba con n = n − 1
al pararte, el resultado es el total`,
  );
});

Deno.test("explainLoop: identidad y constante, fórmula directa", () => {
  assertEquals(explainLoop(Ret, "es"), "el resultado es n, tal cual");
  assertEquals(explainLoop(Suc(Suc(Zero)), "es"), "el resultado es 2, tal cual");
});
