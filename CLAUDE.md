@AGENTS.md

## Charte graphique

Ce repo partage sa charte graphique (couleurs, typographie, icônes) avec `nathafty-customer-survey` — source de vérité unique : [`../DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md). Ne jamais introduire une couleur de marque en dur (hex/oklch) sans vérifier ce fichier en premier ; toute nouvelle valeur doit y être ajoutée avant d'être utilisée ici. Les tokens shadcn `--primary`/`--secondary` dans `src/app/globals.css` sont déjà alignés sur le bleu/vert de marque — ne pas les repasser en gris neutre shadcn par défaut.
