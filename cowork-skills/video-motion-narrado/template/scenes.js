'use strict';
// Configuração de cenas do vídeo. Um id por âncora de anchors.py + 'end' (título final = 1º quadro, fecha o loop).
// Catálogo de módulos e parâmetros: references/modulos.md. Exemplo completo: references/exemplo_scenes_um_dia_na_vida.js
const T = C.teal, R = C.coral, A = C.amber, F = C.fg;
const TITLE = { lines: ['TÍTULO DO', 'VÍDEO AQUI'], colors: [F, T], small: 'SUBTÍTULO CURTO', size: 140 };
const CFG = {
  i01: () => M.title({ ...TITLE, instant: true }),   // 1º quadro: título já montado
  s01: () => M.title({ lines: ['PRIMEIRA', 'CENA'], colors: [F, A] }),
  end: () => M.title({ ...TITLE, noExit: true }),     // último quadro = primeiro quadro
};
// Etiqueta de capítulo (canto superior esquerdo): [id da cena que abre o capítulo, texto]
const CHAPTERS = [['i01', '00 · ABERTURA'], ['s01', '01 · CAPÍTULO']];
