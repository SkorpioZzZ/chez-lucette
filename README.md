# Chez Lucette, site vitrine de démonstration

Site vitrine pour un bistrot de quartier à Paris 10e, au bord du canal Saint-Martin.

> **Projet de démonstration.** Chez Lucette est un établissement fictif. L'adresse précise, les coordonnées, les avis et les mentions légales sont inventés. Le site montre ce que je peux livrer à un commerce de proximité (restaurant, boulangerie, coiffeur...).

## Objectif

Un commerce de proximité a besoin d'un site qui remplit la salle et qui ressort sur Google quand on cherche « restaurant canal Saint-Martin ». Tout le site va dans ce sens :

- la carte et les prix sont visibles tout de suite, sans PDF à télécharger ;
- les horaires sont toujours à jour : le site indique s'il est ouvert en ce moment (heure de Paris) et met en avant le jour courant ;
- la réservation se fait en ligne en une minute, avec uniquement les créneaux où le restaurant est ouvert ;
- le plan Google Maps et le lien d'itinéraire facilitent la venue ;
- le site complète la fiche Google Business Profile de l'établissement : mêmes nom, adresse, téléphone et horaires partout (cohérence NAP).

## Direction artistique

Un style élégant et sombre, pensé comme la salle d'un restaurant le soir :

- fond presque noir, texte crème et une seule couleur d'accent, un doré discret ;
- titres en Cormorant Garamond (serif fine), texte en Jost (sans-serif légère), petites capitales espacées pour les intitulés ;
- beaucoup d'espace, filets fins, aucune ombre ni bordure épaisse ;
- en-tête transparent sur la grande image, qui devient opaque au défilement ;
- apparitions en fondu lentes au défilement, zoom doux sur les photos (tout est coupé si le visiteur a activé « réduire les animations ») ;
- la carte est présentée comme un menu de restaurant, la réservation en trois étapes avec les horaires à côté.

## Pages

| Page | Contenu |
|---|---|
| [index.html](index.html) | Accueil : grande image avec statut « ouvert / fermé », présentation, formules, galerie photo, avis, horaires, plan, appel à réserver |
| [carte.html](carte.html) | Carte complète avec prix, présentée comme un menu de restaurant, onglets de rubrique qui suivent le défilement |
| [reservation.html](reservation.html) | Réservation en 3 étapes (date et convives, créneau, coordonnées) avec créneaux calculés à partir des horaires |
| [mentions-legales.html](mentions-legales.html) | Mentions légales, données personnelles et cookies (RGPD) |

## Référencement local

- Balises `title` et `description` uniques par page, avec le quartier et l'arrondissement
- Données structurées Schema.org `Restaurant` : adresse, coordonnées GPS, horaires détaillés (`openingHoursSpecification`), gamme de prix, type de cuisine, lien vers la carte (`hasMenu`) et la réservation (`acceptsReservations`), note moyenne
- Horaires écrits en HTML (lisibles par Google), pas dans une image
- Balises Open Graph pour le partage sur les réseaux sociaux
- `sitemap.xml` et `robots.txt`, URL canoniques, toutes les pages en `noindex` (site de démo)
- Accès transports en commun dans le texte (requêtes du type « restaurant près de République »)

## Technique

- HTML, CSS et JavaScript, sans framework ni étape de build
- Polices auto-hébergées en WOFF2 (Cormorant Garamond et Jost, licence SIL OFL, 10 à 24 Ko par fichier, les deux principales préchargées) : aucune requête vers Google Fonts
- Plan Google Maps chargé seulement au clic : pas de cookie Google sans l'accord du visiteur, et une page plus légère
- Responsive, conçu d'abord pour le mobile, avec une barre « Appeler / Réserver » fixe en bas de l'écran
- Accessibilité : lien d'évitement, menu mobile plein écran au clavier (Échap pour fermer), galerie dans une `<dialog>` (Échap pour fermer, flèches pour naviguer), erreurs de formulaire liées aux champs, respect de `prefers-reduced-motion`

### Horaires : une seule source

Les horaires sont écrits une seule fois dans le tableau HTML, avec un attribut `data-slots` par jour :

```html
<tr data-day="2" data-slots="12:00-14:30,19:00-22:30">...</tr>
```

Le script [js/main.js](js/main.js) s'en sert pour :

- afficher « Ouvert en ce moment, jusqu'à 22h30 » ou « Fermé, ouvre demain à 12h » ;
- mettre en avant la ligne du jour ;
- générer les créneaux de réservation (toutes les 30 min, dernier créneau 1h avant la fermeture, au moins 1h à l'avance pour le jour même).

Pour changer les horaires, il suffit de modifier le tableau, puis de reporter les mêmes valeurs dans les données structurées de `index.html`.

### Formulaire de réservation

- date limitée aux 60 prochains jours, jour de fermeture refusé ;
- créneaux affichés par service (déjeuner, dîner, brunch) selon la date choisie ;
- au-delà de 8 personnes, le formulaire invite à appeler ;
- validation du nom, du mobile français et de l'e-mail facultatif ;
- champ piège (honeypot) contre les robots, case de consentement obligatoire.

En démo, l'attribut `action` du formulaire est vide : rien n'est envoyé, un message de confirmation s'affiche. Pour un vrai client, deux options :

1. renseigner l'URL d'un service d'envoi (Formspree, Web3Forms) dans `action` : le script envoie alors les données en `fetch` ;
2. remplacer le formulaire par un bouton vers l'outil de réservation du restaurant (TheFork, Zenchef, Planity pour un coiffeur...).

## Photos

Les photos du dossier `img/` viennent d'[Unsplash](https://unsplash.com). Elles servent à la démonstration et ne montrent pas un vrai établissement. Toutes sont sous la [licence Unsplash](https://unsplash.com/license) standard, vérifiée photo par photo le 17/11/2026 (aucune n'est sous licence Unsplash+). Cette licence permet un usage commercial gratuit, sans autorisation à demander. Le crédit n'est pas obligatoire, mais il figure dans les mentions légales. Elle interdit de revendre les photos sans les modifier nettement, ou de les regrouper pour créer un service concurrent.

| Fichier | Contenu | Photographe | Source |
|---|---|---|---|
| `hero-salle` | salle de restaurant, comptoir | Martin Baron | [AzsTi2sleZY](https://unsplash.com/photos/AzsTi2sleZY) |
| `maison-chef` | chef qui taille des légumes (recadré en portrait) | Pylyp Sukhenko | [y-XZf_TNRms](https://unsplash.com/photos/y-XZf_TNRms) |
| `galerie-plat` | plat servi à table | Spencer Davis | [W_GSHCi0cR8](https://unsplash.com/photos/W_GSHCi0cR8) |
| `galerie-terrasse` | terrasse sur le trottoir | ayumi kubo | [h-wj-v9FZjM](https://unsplash.com/photos/h-wj-v9FZjM) |
| `galerie-vins` | bouteilles sur étagères | Javier Balseiro | [jDU4yYk5Kgs](https://unsplash.com/photos/jDU4yYk5Kgs) |
| `galerie-dessert` | verrine chocolat | Emile Mbunzama | [cLpdEA23Z44](https://unsplash.com/photos/cLpdEA23Z44) |
| `galerie-salle` | salle, banquettes en cuir | Nick Karvounis | [Ciqxn7FE4vE](https://unsplash.com/photos/Ciqxn7FE4vE) |
| `galerie-cuisine` | chef en cuisine | Ahmet Safa Türkyılmaz | [F9v4iq0RDZ0](https://unsplash.com/photos/F9v4iq0RDZ0) |

Elles sont servies en WebP (27 à 130 Ko par fichier, environ 500 Ko pour toutes les photos de l'accueil sur mobile, contre 1,8 Mo en JPG) :

- `hero-salle.webp` (1600 px) et `hero-salle-800.webp` : le navigateur choisit via `srcset` selon la largeur de l'écran ;
- `galerie-*.webp` (800 px, 500 px pour le dessert en portrait) pour les vignettes, `galerie-*-1200.webp` (900 px pour le dessert) pour l'agrandissement ;
- `maison-chef.webp` (800 px) ;
- `og-image.jpg` (1200 × 630, en JPG pour tous les réseaux sociaux) : l'aperçu affiché quand le lien est partagé.

Si une photo change, mettez à jour ce tableau et la section « Crédits » de [mentions-legales.html](mentions-legales.html).

Sur un site client, elles sont remplacées par les photos de l'établissement en WebP, aux mêmes noms et dimensions (qualité 70 à 75, 150 Ko maximum par fichier) :

| Fichier | Photo attendue |
|---|---|
| `hero-salle` | la salle ou la devanture, en largeur |
| `maison-chef` | le chef ou l'équipe, en portrait |
| `galerie-plat` | le plat signature |
| `galerie-terrasse` | la terrasse |
| `galerie-salle` | la salle |
| `galerie-vins` | les vins ou le comptoir |
| `galerie-dessert` | un dessert |
| `galerie-cuisine` | l'équipe en cuisine |

Idéalement, ce sont les mêmes photos que sur la fiche Google Business Profile.

## Lancer le site

Pas d'installation. Ouvrez `index.html` dans un navigateur, ou lancez un petit serveur local :

```bash
python3 -m http.server 8000
```

puis allez sur http://localhost:8000.

Le site peut être hébergé tel quel sur n'importe quel hébergement statique (GitHub Pages, Netlify, OVH...). La démo est publiée sur `https://skorpiozzz.github.io/chez-lucette/`. Toutes les pages portent `<meta name="robots" content="noindex">` pour que ce restaurant fictif ne soit pas indexé. Pour un vrai client, remplacez cette adresse par son domaine dans les balises `canonical`, `og:image`, les données structurées, `robots.txt` et `sitemap.xml`, puis retirez le `noindex`.

## Structure

```
.
├── index.html
├── carte.html
├── reservation.html
├── mentions-legales.html
├── robots.txt
├── sitemap.xml
├── css/
│   └── style.css
├── fonts/        polices WOFF2 auto-hébergées
├── img/          photos Unsplash (à remplacer par celles de l'établissement)
└── js/
    └── main.js
```

## Auteur

Alexandre Zapolski, développeur web freelance : [profil Malt](https://www.malt.fr/profile/alexandrezapolski)
