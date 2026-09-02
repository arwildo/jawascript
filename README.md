# JawaScript

> JavaScript nganggo basa Jawa.

JawaScript adalah **source to source transpiler** kecil yang menerjemahkan file `.jawa` menjadi JavaScript, lalu mengeksekusinya dengan Node.js.

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
} yen ora {
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
ono x = 10;
ono y = 20;

tampilno(x + y);

yen (x < y) {
    tampilno("x luwih cilik");
} yen ora {
    tampilno("x luwih gedhe");
}
```

## Keyword

| Jawa     | JavaScript  |
| -------- | ----------- |
| ono      | let         |
| tampilno | console.log |
| yen      | if          |
| yen ora  | else        |

## Cara Kerja

File `.jawa` dibaca, keyword Jawa diganti dengan JavaScript menggunakan regex word boundary (urutan replacement penting: `yen ora` diproses sebelum `yen`), lalu dieksekusi.
JawaScript adalah project eksperimen yang dibuat untuk bersenang senang dan belajar bahasa jawa secara secara programming.

