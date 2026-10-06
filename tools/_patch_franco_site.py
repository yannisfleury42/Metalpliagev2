# -*- coding: utf-8 -*-
"""Recale le franco de port sur TOUT le site : 450 -> 300 EUR TTC, et remplace
les anciens montants de grille (11 / 57 EUR) par les nouveaux (55 / 60 EUR).

Sans cette passe, le site annonce 450 EUR dans ses meta descriptions, ses
bandeaux et ses FAQ JSON-LD pendant que le panier applique 300 : incoherence
visible par le client, et prix faux dans les rich snippets Google.

Lancer : python tools/_patch_franco_site.py
"""
import io, os, glob, re

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

fichiers = [f for f in glob.glob("*.html") + glob.glob("blog/*.html")]

# L'ancienne phrase de grille, declinee sur 5 pages.
VIEILLE_GRILLE = (u"à partir de 11 € HT pour un colis d'accessoires, "
                  u"57 € HT pour un fardeau de barres")
NOUVELLE_GRILLE = u"à partir de 60 € HT pour un profil de 2 m"

total = 0
touches = []
for f in fichiers:
    s = io.open(f, encoding="utf-8").read()
    o = s
    s = s.replace(VIEILLE_GRILLE, NOUVELLE_GRILLE)
    # Uniquement « 450 € » et « 450&nbsp;€ » : jamais « 450 km », « 450kbs »,
    # les emoji unicode \u{1F450} ni les coordonnees SVG y2="450".
    s = s.replace(u"450 €", u"300 €").replace(u"450&nbsp;€", u"300&nbsp;€")
    if s != o:
        io.open(f, "w", encoding="utf-8").write(s)
        n = len(re.findall(u"300 €|300&nbsp;€|" + re.escape(NOUVELLE_GRILLE), s))
        touches.append((f, n))
        total += 1

for f, n in touches:
    print("  %-52s %d mention(s)" % (f, n))
print("%d fichiers recales" % total)
