<p align=center><img src="https://raw.githubusercontent.com/arwildo/jawascript/refs/heads/main/jawascript.png" width="86"></img></p> 

# JawaScript
> JavaScript nganggo basa Jawa.

JawaScript adalah **transpiler** kecil yang mengubah berkas `.jawa` menjadi JavaScript melalui tiga tahap: **tokenizer → parser → emitter**, lalu mengeksekusinya dengan Node.js. Versi ini tidak lagi memakai regex pengganti kata sederhana — bahasa diparsing sungguhan sehingga string/komentar tak pernah salah diubah, dan kamus kata terpusat di satu berkas.

## Install

```bash
npm install -g @arwildo/jawascript
```

## Usage

Buat file `hello.jawa`:

```jawa
ono x = 10;
ono y = 20;

tampilno(x + y);

yen (x < y) {
    tampilno("x luwih cilik");
} liyane {
    tampilno("x luwih gedhe");
}
```

Jalankan:

```bash
jawa hello.jawa
```

Output:

```
30
x luwih cilik
```

## Contoh

```jawa
kelas Kethek {
    constructor(jeneng) {
        iki.jeneng = jeneng;
    }

    mangan(kg) {
        tampilno(iki.jeneng + " mangan " + kg + " kg");
    }
}

ono si = anyar Kethek("Kiki");
si.mangan(2);

sambil fungsi jalur() {
    enteni janji((selesai) => setTimeout(selesai, 10));
    tampil.serat("selesai");
}

jalur();
```

Contoh lain tersedia di folder `examples/`: `oop`, `async`, `error`, `switch`, `fors`, `console`, `web` (butuh browser).

## Keyword

Semua kata terpusat di **`src/keywords.js`** — untuk ganti/tambah kata cukup edit berkas itu saja.

**Dasar**

| Jawa          | JavaScript    |
| ------------- | ------------- |
| `ono`         | `let`         |
| `paten`       | `const`       |
| `tampilno`    | `console.log` |
| `yen`         | `if`          |
| `liyane yen`  | `else if`     |
| `liyane`      | `else`        |
| `nganti`      | `while`       |
| `kanggo`      | `for`         |
| `saka`        | `of` (`for...of`) |
| `ing`         | `in` (`for...in`) |
| `fungsi`      | `function`    |
| `balekno`     | `return`      |
| `mandheg`     | `break`       |
| `lanjutna`    | `continue`    |
| `bener`       | `true`        |
| `salah`       | `false`       |

**Kelas & OOP**

| Jawa       | JavaScript |
| ---------- | ---------- |
| `kelas`    | `class`    |
| `warisan`  | `extends`  |
| `anyar`    | `new`      |
| `iki`      | `this`     |

**Async**

| Jawa       | JavaScript |
| ---------- | ---------- |
| `sambil`  | `async`    |
| `enteni`   | `await`    |

**Error handling**

| Jawa        | JavaScript |
| ----------- | ---------- |
| `nyoba`     | `try`      |
| `nompo`  | `catch`    |
| `akhire` | `finally`  |
| `buang`     | `throw`    |

**Lainnya**

| Jawa     | JavaScript  |
| -------- | ----------- |
| `milih`   | `switch`    |
| `kasus`   | `case`      |
| `asale`   | `default`   |
| `kosong`  | `null`      |
| `rajelas` | `undefined` |

> **Catatan:** operator memakai simbol JS aslinya dan tidak diterjemahkan — `==`, `===`, `!==`, `!=`, `!`, `=`, `&&`, `||`, `<`, `>`, dst. ditulis persis seperti JavaScript. Arrow `=>` juga dipakai apa adanya, misal `(e) => tampilno(e)`.
>
> **Belum didukung:** `typeof`, `instanceof`, template literal, destructuring, getter/setter.

### Member: console & DOM

Kamus member (`MEMBERS` di `src/keywords.js`) memetakan objek/method umum:

| Jawa                  | JavaScript            |
| --------------------- | --------------------- |
| `tampil.serat`        | `console.log`         |
| `tampil.ngadat`       | `console.error`       |
| `tampil.awas`         | `console.warn`        |
| `tampil.kabar`        | `console.info`        |
| `tampil.tabel`        | `console.table`       |
| `dokumen`             | `document`            |
| `layar`               | `window`              |
| `janji`               | `Promise`             |
| `kirim`               | `fetch`               |
| `jupuk`               | `querySelector`       |
| `jupukKabeh`          | `querySelectorAll`    |
| `jupukId`             | `getElementById`      |
| `gawe`                | `createElement`       |
| `tempel`              | `appendChild`         |
| `rungokno`            | `addEventListener`    |

Contoh: `dokumen.jupuk("#tombol").rungokno("click", (e) => { ... })` → `document.querySelector("#tombol").addEventListener("click", ...)`.

Contoh di `examples/` yang memakai DOM (`web.jawa`) memerlukan **browser**; yang lain berjalan di Node.js.

## Cara Kerja

1. **Tokenizer** (`src/tokenizer.js`) memecah `.jawa` menjadi token (identifier, keyword, angka, string, operator). Kata yang mirip dicocokkan paling panjang dulu, misal `tampilno` vs `tampil`, supaya tidak keliru.
2. **Parser** (`src/parser.js`) membangun AST dengan *recursive descent*. Percabangan, perulangan, fungsi, class/OOP, async/await, error handling, switch, dan object/array benar-benar diparsing.
3. **Emitter** (`src/emitter.js`) mengubah AST menjadi JavaScript, lalu dieksekusi.

Mengganti kata cukup di `src/keywords.js`; tokenizer/parser/emitter otomatis mengikuti tanpa perubahan lain.

JawaScript adalah project eksperimen yang dibuat untuk bersenang senang dan belajar bahasa jawa secara secara programming.

