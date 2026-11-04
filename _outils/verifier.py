#!/usr/bin/env python3
"""Contrôle le site avant publication.

    python3 _outils/verifier.py

Vérifie : liens et fichiers locaux cassés, ancres, images sans alt, identifiants
dupliqués, un seul h1 par page, titre et langue présents, marqueurs « à compléter »
oubliés, et la présence de chaque page dans les deux langues.
"""
import pathlib
import sys
from html.parser import HTMLParser

RACINE = pathlib.Path(__file__).resolve().parent.parent
EXTERNES = ("http://", "https://", "mailto:", "tel:", "data:", "javascript:")


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.liens, self.erreurs = [], [], []
        self.h1 = 0
        self.titre = ""
        self.dans_titre = False
        self.lang = None
        self.todo = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html":
            self.lang = a.get("lang")
        if tag == "title":
            self.dans_titre = True
        if tag == "h1":
            self.h1 += 1
        if "id" in a:
            self.ids.append(a["id"])
        if "todo" in (a.get("class") or "").split():
            self.todo += 1
        if tag == "img" and a.get("alt") is None:
            self.erreurs.append("image sans alt : %s" % a.get("src"))
        for cle in ("href", "src"):
            if a.get(cle):
                self.liens.append(a[cle])

    def handle_endtag(self, tag):
        if tag == "title":
            self.dans_titre = False

    def handle_data(self, data):
        if self.dans_titre:
            self.titre += data


def main():
    pages = sorted(list(RACINE.glob("*.html")) + list(RACINE.glob("en/*.html")))
    erreurs = 0
    for p in pages:
        nom = p.relative_to(RACINE)
        d = Page()
        d.feed(p.read_text(encoding="utf-8"))
        problemes = list(d.erreurs)
        if not d.titre.strip():
            problemes.append("balise <title> vide")
        if not d.lang:
            problemes.append("attribut lang manquant")
        if d.h1 != 1:
            problemes.append("%d balise(s) h1 (attendu : 1)" % d.h1)
        doublons = {i for i in d.ids if d.ids.count(i) > 1}
        if doublons:
            problemes.append("identifiants dupliqués : %s" % ", ".join(sorted(doublons)))
        if d.todo:
            problemes.append("%d champ(s) « à compléter » restant(s)" % d.todo)
        for lien in d.liens:
            if lien.startswith(EXTERNES) or lien == "":
                continue
            cible, _, ancre = lien.partition("#")
            cible = cible.split("?")[0]   # ?v=… : numéro de version contre le cache du navigateur
            fichier = (p.parent / cible) if cible else p
            if not fichier.exists():
                problemes.append("lien cassé : %s" % lien)
            elif ancre and fichier.suffix == ".html" and fichier.exists():
                sous = Page()
                sous.feed(fichier.read_text(encoding="utf-8"))
                if ancre not in sous.ids:
                    problemes.append("ancre introuvable : %s" % lien)
        if problemes:
            erreurs += len(problemes)
            print("✗", nom)
            for x in problemes:
                print("   -", x)
        else:
            print("✓", nom)
    fr = {p.name for p in RACINE.glob("*.html")}
    en = {p.name for p in (RACINE / "en").glob("*.html")}
    for manque in sorted(fr ^ en):
        erreurs += 1
        print("✗ page présente dans une seule langue :", manque)
    print("\n%d page(s), %d problème(s)." % (len(pages), erreurs))
    sys.exit(1 if erreurs else 0)


if __name__ == "__main__":
    main()
