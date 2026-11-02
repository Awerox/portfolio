#!/usr/bin/env python3
"""Recopie l'en-tête et le pied de page de index.html vers les autres pages.

Le français (racine) et l'anglais (dossier en/) ont chacun leur index.html,
qui sert de modèle. Après toute modification du menu ou du pied de page :

    python3 _outils/propager.py

Le script règle aussi le lien actif du menu et le bouton FR/EN de chaque page.
"""
import pathlib
import re

RACINE = pathlib.Path(__file__).resolve().parent.parent


def bloc(texte, nom):
    return re.search(r"<!-- #%s -->(.*?)<!-- /#%s -->" % (nom, nom), texte, re.S)


def propager(dossier, est_en):
    modele = (dossier / "index.html").read_text(encoding="utf-8")
    n = 0
    for page in sorted(dossier.glob("*.html")):
        if page.name == "index.html":
            continue
        texte = page.read_text(encoding="utf-8")
        nouveau = texte
        for nom in ("header", "footer"):
            src, dst = bloc(modele, nom), bloc(nouveau, nom)
            if not src or not dst:
                print("  ! marqueurs manquants dans", page.relative_to(RACINE))
                continue
            contenu = src.group(1).replace('href="#top"', 'href="index.html"')
            if nom == "header":
                contenu = contenu.replace(' aria-current="page"', "")
                # lien actif : entrée du menu, ou bouton « Contact » pour contact.html
                contenu = re.sub(r'(<a class="(?:nl|btn btn-main cta-top)" href="%s")' % re.escape(page.name),
                                 r'\1 aria-current="page"', contenu)
                autre = ("../" if est_en else "en/") + page.name
                contenu = re.sub(r'(id="lang" href=")[^"]*"', r'\g<1>%s"' % autre, contenu)
            nouveau = nouveau[:dst.start(1)] + contenu + nouveau[dst.end(1):]
        if nouveau != texte:
            page.write_text(nouveau, encoding="utf-8")
            n += 1
            print("  mis à jour :", page.relative_to(RACINE))
    return n


if __name__ == "__main__":
    total = propager(RACINE, False) + propager(RACINE / "en", True)
    print("%d page(s) modifiée(s)." % total if total else "Rien à changer : toutes les pages sont à jour.")
