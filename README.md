# Hipoteka — kalkulator kredytu i nadpłat

Aplikacja React + TypeScript + Vite.

## Uruchomienie lokalne

Wymagania: Node.js 22.18 lub nowszy oraz npm.
Rozpakuj ZIP, otwórz terminal w katalogu hipoteka i wykonaj:

```sh
npm ci
npm run dev
```

Otwórz w przeglądarce adres pokazany w terminalu.
Instalacja zależności wymaga internetu.

## Testy obliczeń

```sh
npm test
```

## Wersja do publikacji

```sh
npm run build
```

Gotowa strona powstanie w katalogu dist. Można ją umieścić na hostingu stron statycznych.

## Pliki

- src/loan.ts — obliczenia harmonogramu w groszach
- src/loan.test.ts — testy obliczeń
- src/main.tsx — formularz, podsumowanie i tabela
- src/style.css — wygląd i układ responsywny

## Założenia

Stała roczna stopa procentowa, miesięczne odsetki = kapitał × stopa roczna / 12.
Nadpłata następuje po racie i obniża kolejne raty przy zachowaniu terminu.
Całkowita spłata kończy harmonogram. Kwoty zaokrąglane do groszy.
Bez prowizji, ubezpieczeń i dodatkowych opłat. Dane nie są utrwalane po odświeżeniu strony.
