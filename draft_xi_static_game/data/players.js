/*
  Локальная "база данных" игроков.
  Работает без сервера и без Node.js: index.html просто подключает этот файл.

  Как добавить игрока:
  1) Скопируй любой объект ниже.
  2) Поменяй id, clubCode, clubName, season, name, positions, stats.
  3) positions — список позиций, куда игрока можно поставить: GK, RB, CB, LB, CM, RW, ST, LW.
  4) icon — необязательное поле. Можно положить картинку в папку assets и написать путь, например: "assets/kane.png".
*/
window.PLAYERS_DB = [
  // Tottenham Hotspur 2018
  { id: "tot2018-lloris", clubCode: "TOT", clubName: "Tottenham Hotspur", season: 2018, name: "H. Lloris", positions: ["GK"], age: 30, number: 1, initials: "HL", stats: { pac: 88, sho: 86, pas: 68, dri: 90, def: 64, phy: 82, ovr: 88 } },
  { id: "tot2018-eriksen", clubCode: "TOT", clubName: "Tottenham Hotspur", season: 2018, name: "C. Eriksen", positions: ["CM", "RW", "LW"], age: 25, number: 23, initials: "CE", stats: { pac: 75, sho: 78, pas: 88, dri: 84, def: 47, phy: 63, ovr: 87 } },
  { id: "tot2018-alderweireld", clubCode: "TOT", clubName: "Tottenham Hotspur", season: 2018, name: "T. Alderweireld", positions: ["CB"], age: 28, number: 4, initials: "TA", stats: { pac: 66, sho: 58, pas: 72, dri: 65, def: 87, phy: 80, ovr: 86 } },
  { id: "tot2018-kane", clubCode: "TOT", clubName: "Tottenham Hotspur", season: 2018, name: "H. Kane", positions: ["ST"], age: 23, number: 10, initials: "HK", stats: { pac: 71, sho: 87, pas: 72, dri: 78, def: 42, phy: 83, ovr: 86 } },
  { id: "tot2018-vertonghen", clubCode: "TOT", clubName: "Tottenham Hotspur", season: 2018, name: "J. Vertonghen", positions: ["CB", "LB"], age: 30, number: 5, initials: "JV", stats: { pac: 67, sho: 65, pas: 73, dri: 70, def: 85, phy: 81, ovr: 85 } },
  { id: "tot2018-alli", clubCode: "TOT", clubName: "Tottenham Hotspur", season: 2018, name: "D. Alli", positions: ["CM", "LW"], age: 21, number: 20, initials: "DA", stats: { pac: 76, sho: 81, pas: 77, dri: 82, def: 64, phy: 78, ovr: 84 } },
  { id: "tot2018-dembele", clubCode: "TOT", clubName: "Tottenham Hotspur", season: 2018, name: "M. Dembélé", positions: ["CM"], age: 29, number: 19, initials: "MD", stats: { pac: 76, sho: 72, pas: 77, dri: 85, def: 75, phy: 84, ovr: 83 } },
  { id: "tot2018-rose", clubCode: "TOT", clubName: "Tottenham Hotspur", season: 2018, name: "D. Rose", positions: ["LB"], age: 26, number: 3, initials: "DR", stats: { pac: 81, sho: 63, pas: 73, dri: 78, def: 81, phy: 78, ovr: 82 } },
  { id: "tot2018-wanyama", clubCode: "TOT", clubName: "Tottenham Hotspur", season: 2018, name: "V. Wanyama", positions: ["CM", "CB"], age: 26, number: 12, initials: "VW", stats: { pac: 64, sho: 66, pas: 70, dri: 74, def: 82, phy: 91, ovr: 82 } },
  { id: "tot2018-son", clubCode: "TOT", clubName: "Tottenham Hotspur", season: 2018, name: "H. Son", positions: ["LW", "RW", "ST"], age: 25, number: 7, initials: "HS", stats: { pac: 86, sho: 83, pas: 75, dri: 83, def: 25, phy: 66, ovr: 82 } },
  { id: "tot2018-trippier", clubCode: "TOT", clubName: "Tottenham Hotspur", season: 2018, name: "K. Trippier", positions: ["RB"], age: 26, number: 2, initials: "KT", stats: { pac: 76, sho: 59, pas: 78, dri: 76, def: 78, phy: 70, ovr: 81 } },
  { id: "tot2018-sanchez", clubCode: "TOT", clubName: "Tottenham Hotspur", season: 2018, name: "D. Sánchez", positions: ["CB"], age: 21, number: 6, initials: "DS", stats: { pac: 78, sho: 44, pas: 62, dri: 68, def: 81, phy: 82, ovr: 81 } },

  // Arsenal 2017
  { id: "ars2017-cech", clubCode: "ARS", clubName: "Arsenal", season: 2017, name: "P. Čech", positions: ["GK"], age: 34, number: 33, initials: "PC", stats: { pac: 83, sho: 82, pas: 65, dri: 84, def: 60, phy: 80, ovr: 86 } },
  { id: "ars2017-alexis", clubCode: "ARS", clubName: "Arsenal", season: 2017, name: "A. Sánchez", positions: ["LW", "RW", "ST"], age: 28, number: 7, initials: "AS", stats: { pac: 86, sho: 84, pas: 80, dri: 89, def: 45, phy: 78, ovr: 88 } },
  { id: "ars2017-ozil", clubCode: "ARS", clubName: "Arsenal", season: 2017, name: "M. Özil", positions: ["CM", "RW"], age: 28, number: 11, initials: "MO", stats: { pac: 74, sho: 76, pas: 89, dri: 86, def: 24, phy: 58, ovr: 88 } },
  { id: "ars2017-koscielny", clubCode: "ARS", clubName: "Arsenal", season: 2017, name: "L. Koscielny", positions: ["CB"], age: 31, number: 6, initials: "LK", stats: { pac: 76, sho: 47, pas: 66, dri: 68, def: 86, phy: 78, ovr: 85 } },
  { id: "ars2017-bellerin", clubCode: "ARS", clubName: "Arsenal", season: 2017, name: "H. Bellerín", positions: ["RB"], age: 22, number: 24, initials: "HB", stats: { pac: 94, sho: 54, pas: 70, dri: 79, def: 77, phy: 71, ovr: 82 } },
  { id: "ars2017-monreal", clubCode: "ARS", clubName: "Arsenal", season: 2017, name: "N. Monreal", positions: ["LB", "CB"], age: 31, number: 18, initials: "NM", stats: { pac: 76, sho: 61, pas: 73, dri: 76, def: 80, phy: 73, ovr: 81 } },
  { id: "ars2017-ramsey", clubCode: "ARS", clubName: "Arsenal", season: 2017, name: "A. Ramsey", positions: ["CM"], age: 26, number: 8, initials: "AR", stats: { pac: 74, sho: 77, pas: 78, dri: 81, def: 72, phy: 78, ovr: 82 } },
  { id: "ars2017-xhaka", clubCode: "ARS", clubName: "Arsenal", season: 2017, name: "G. Xhaka", positions: ["CM"], age: 24, number: 29, initials: "GX", stats: { pac: 50, sho: 76, pas: 82, dri: 73, def: 75, phy: 82, ovr: 82 } },
  { id: "ars2017-giroud", clubCode: "ARS", clubName: "Arsenal", season: 2017, name: "O. Giroud", positions: ["ST"], age: 30, number: 12, initials: "OG", stats: { pac: 59, sho: 82, pas: 71, dri: 75, def: 47, phy: 83, ovr: 83 } },
  { id: "ars2017-walcott", clubCode: "ARS", clubName: "Arsenal", season: 2017, name: "T. Walcott", positions: ["RW", "ST"], age: 28, number: 14, initials: "TW", stats: { pac: 89, sho: 78, pas: 72, dri: 80, def: 36, phy: 68, ovr: 81 } },

  // Barcelona 2015
  { id: "bar2015-terstegen", clubCode: "BAR", clubName: "Barcelona", season: 2015, name: "M. ter Stegen", positions: ["GK"], age: 23, number: 1, initials: "MT", stats: { pac: 84, sho: 82, pas: 79, dri: 86, def: 62, phy: 78, ovr: 83 } },
  { id: "bar2015-messi", clubCode: "BAR", clubName: "Barcelona", season: 2015, name: "L. Messi", positions: ["RW", "ST"], age: 28, number: 10, initials: "LM", stats: { pac: 92, sho: 90, pas: 86, dri: 96, def: 28, phy: 64, ovr: 94 } },
  { id: "bar2015-neymar", clubCode: "BAR", clubName: "Barcelona", season: 2015, name: "Neymar", positions: ["LW", "RW"], age: 23, number: 11, initials: "NJ", stats: { pac: 90, sho: 84, pas: 77, dri: 92, def: 31, phy: 61, ovr: 90 } },
  { id: "bar2015-suarez", clubCode: "BAR", clubName: "Barcelona", season: 2015, name: "L. Suárez", positions: ["ST"], age: 28, number: 9, initials: "LS", stats: { pac: 82, sho: 88, pas: 79, dri: 87, def: 42, phy: 79, ovr: 91 } },
  { id: "bar2015-iniesta", clubCode: "BAR", clubName: "Barcelona", season: 2015, name: "A. Iniesta", positions: ["CM"], age: 31, number: 8, initials: "AI", stats: { pac: 74, sho: 73, pas: 89, dri: 90, def: 58, phy: 62, ovr: 88 } },
  { id: "bar2015-busquets", clubCode: "BAR", clubName: "Barcelona", season: 2015, name: "S. Busquets", positions: ["CM", "CB"], age: 27, number: 5, initials: "SB", stats: { pac: 56, sho: 62, pas: 80, dri: 78, def: 84, phy: 78, ovr: 86 } },
  { id: "bar2015-rakitic", clubCode: "BAR", clubName: "Barcelona", season: 2015, name: "I. Rakitić", positions: ["CM"], age: 27, number: 4, initials: "IR", stats: { pac: 66, sho: 83, pas: 86, dri: 84, def: 72, phy: 75, ovr: 85 } },
  { id: "bar2015-alba", clubCode: "BAR", clubName: "Barcelona", season: 2015, name: "J. Alba", positions: ["LB"], age: 26, number: 18, initials: "JA", stats: { pac: 92, sho: 68, pas: 78, dri: 84, def: 80, phy: 72, ovr: 84 } },
  { id: "bar2015-pique", clubCode: "BAR", clubName: "Barcelona", season: 2015, name: "G. Piqué", positions: ["CB"], age: 28, number: 3, initials: "GP", stats: { pac: 66, sho: 61, pas: 74, dri: 70, def: 87, phy: 78, ovr: 85 } },
  { id: "bar2015-alves", clubCode: "BAR", clubName: "Barcelona", season: 2015, name: "D. Alves", positions: ["RB", "RW"], age: 32, number: 22, initials: "DA", stats: { pac: 84, sho: 72, pas: 80, dri: 84, def: 79, phy: 70, ovr: 83 } },

  // Real Madrid 2017
  { id: "rma2017-navas", clubCode: "RMA", clubName: "Real Madrid", season: 2017, name: "K. Navas", positions: ["GK"], age: 30, number: 1, initials: "KN", stats: { pac: 85, sho: 82, pas: 70, dri: 86, def: 64, phy: 82, ovr: 86 } },
  { id: "rma2017-ronaldo", clubCode: "RMA", clubName: "Real Madrid", season: 2017, name: "C. Ronaldo", positions: ["LW", "ST"], age: 32, number: 7, initials: "CR", stats: { pac: 90, sho: 93, pas: 82, dri: 91, def: 35, phy: 80, ovr: 94 } },
  { id: "rma2017-bale", clubCode: "RMA", clubName: "Real Madrid", season: 2017, name: "G. Bale", positions: ["RW", "LW"], age: 27, number: 11, initials: "GB", stats: { pac: 94, sho: 87, pas: 83, dri: 86, def: 58, phy: 76, ovr: 89 } },
  { id: "rma2017-benzema", clubCode: "RMA", clubName: "Real Madrid", season: 2017, name: "K. Benzema", positions: ["ST"], age: 29, number: 9, initials: "KB", stats: { pac: 79, sho: 84, pas: 81, dri: 86, def: 39, phy: 74, ovr: 86 } },
  { id: "rma2017-modric", clubCode: "RMA", clubName: "Real Madrid", season: 2017, name: "L. Modrić", positions: ["CM"], age: 31, number: 10, initials: "LM", stats: { pac: 74, sho: 76, pas: 86, dri: 90, def: 72, phy: 66, ovr: 89 } },
  { id: "rma2017-kroos", clubCode: "RMA", clubName: "Real Madrid", season: 2017, name: "T. Kroos", positions: ["CM"], age: 27, number: 8, initials: "TK", stats: { pac: 52, sho: 82, pas: 90, dri: 82, def: 70, phy: 71, ovr: 88 } },
  { id: "rma2017-casemiro", clubCode: "RMA", clubName: "Real Madrid", season: 2017, name: "Casemiro", positions: ["CM", "CB"], age: 25, number: 14, initials: "CA", stats: { pac: 63, sho: 72, pas: 75, dri: 72, def: 84, phy: 88, ovr: 84 } },
  { id: "rma2017-marcelo", clubCode: "RMA", clubName: "Real Madrid", season: 2017, name: "Marcelo", positions: ["LB"], age: 29, number: 12, initials: "MA", stats: { pac: 79, sho: 71, pas: 81, dri: 88, def: 81, phy: 80, ovr: 87 } },
  { id: "rma2017-ramos", clubCode: "RMA", clubName: "Real Madrid", season: 2017, name: "S. Ramos", positions: ["CB"], age: 31, number: 4, initials: "SR", stats: { pac: 76, sho: 70, pas: 72, dri: 74, def: 88, phy: 83, ovr: 90 } },
  { id: "rma2017-carvajal", clubCode: "RMA", clubName: "Real Madrid", season: 2017, name: "D. Carvajal", positions: ["RB"], age: 25, number: 2, initials: "DC", stats: { pac: 83, sho: 58, pas: 78, dri: 81, def: 83, phy: 80, ovr: 84 } }
];
