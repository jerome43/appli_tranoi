Dézipper l'archive.

Installer le dossier contenant l'application où vous le souhaitez sur le disque dur.

Lancer Chrome.
Dans la barre d'adresse du navigateur, saisir chrome://flags
Trouver « API des extensions expérimentales » et cliquer sur « Activer ».
version anglaise : "Experimental Extension APIs" => enabled
Redémarrer Chrome.

Aller ensuite dans le menu  de chrome => plus d'outils => extensions
S'assurer que le « mode développeur » est coché.
Cliquer sur « charger l'extension non empaquetée », naviguer jusqu'au dossier de l'application et cliquer sur « ok ».

L'application apparaît maintenant dans la liste des extensions de Chrome.

Repérer l'identifiant de l'extension nouvellement crée (si elle ne s'affiche pas entièrement, cliquer sur détail)

Retourner sur le bureau de windows, clic droit, nouveau raccourci.

Renseigner l'emplacement du fichier d’exécution de chrome installé sur l'ordinateur, puis suivant, terminer.

Re-clic-droit sur le raccourci nouvellement crée, puis propriété, ensuite dans cible, à la fin du chemin d'accès, mettre un espace blanc puis --app-id=identifiantdelextenionnonempaquetée

Le chemin d'accès du raccourci est quelque chose comme "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app-id=badolnnnaogllkoejbebdkihfdlmihlg

valider, normalement, le raccourci lance l'extension après cela.