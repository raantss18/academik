/** Aides Python fournies aux tests d'une carte « code » (écrites une seule fois, utilisées par le moteur ET par les tests de contenu).
 *  `_sortie` : ce que le programme a affiché. `_code` : son texte. `_essai(x=3, ...)` : relance le programme en remplaçant la valeur
 *  des affectations de premier niveau `x = …` par celles données, et renvoie ce qu'il affiche : on teste la logique, pas une valeur écrite en dur. */
export const PY_HELPERS = `
def _essai(**valeurs):
    import ast, io, contextlib
    arbre = ast.parse(_code)
    for n in arbre.body:
        if isinstance(n, ast.Assign) and len(n.targets) == 1 and isinstance(n.targets[0], ast.Name) and n.targets[0].id in valeurs:
            n.value = ast.copy_location(ast.Constant(valeurs[n.targets[0].id]), n.value)
    ast.fix_missing_locations(arbre)
    tampon = io.StringIO()
    with contextlib.redirect_stdout(tampon):
        exec(compile(arbre, "<essai>", "exec"), {})
    return tampon.getvalue().strip()
`;
