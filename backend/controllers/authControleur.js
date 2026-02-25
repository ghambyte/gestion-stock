const { Utilisateur } = require('../models');
const jwt = require('jsonwebtoken');
const { reponseSucces, reponseErreur } = require('../utils/reponseApi');

// Generer un token JWT
const genererToken = (utilisateur) => {
  return jwt.sign(
    { id: utilisateur.id, role: utilisateur.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// POST /inscription - Inscription d'un nouveau vendeur
const inscription = async (req, res) => {
  try {
    const { nom, email, motDePasse, telephone } = req.body;

    // Verifier si l'email existe deja
    const utilisateurExistant = await Utilisateur.findOne({ where: { email } });
    if (utilisateurExistant) {
      return reponseErreur(res, 400, 'Cet email est deja utilise.');
    }

    // Verifier si le telephone existe deja
    if (telephone) {
      const telephoneExistant = await Utilisateur.findOne({ where: { telephone } });
      if (telephoneExistant) {
        return reponseErreur(res, 400, 'Ce numero de telephone est deja utilise.');
      }
    }

    // Creer l'utilisateur avec le role vendeur
    const utilisateur = await Utilisateur.create({
      nom,
      email,
      motDePasse,
      telephone,
      role: 'vendeur',
    });

    // Generer le token
    const token = genererToken(utilisateur);

    return reponseSucces(res, 201, 'Inscription reussie.', {
      utilisateur,
      token,
    });
  } catch (erreur) {
    console.error('Erreur inscription:', erreur);
    return reponseErreur(res, 500, 'Erreur lors de l\'inscription.', erreur.message);
  }
};

// POST /connexion - Connexion d'un utilisateur
const connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Chercher l'utilisateur par email
    const utilisateur = await Utilisateur.findOne({ where: { email } });
    if (!utilisateur) {
      return reponseErreur(res, 401, 'Email ou mot de passe incorrect.');
    }

    // Verifier si le compte est actif
    if (!utilisateur.estActif) {
      return reponseErreur(res, 403, 'Compte desactive. Contactez l\'administrateur.');
    }

    // Verifier le mot de passe
    const motDePasseValide = await utilisateur.comparerMotDePasse(motDePasse);
    if (!motDePasseValide) {
      return reponseErreur(res, 401, 'Email ou mot de passe incorrect.');
    }

    // Mettre a jour la derniere connexion
    await utilisateur.update({ derniereConnexion: new Date() });

    // Generer le token
    const token = genererToken(utilisateur);

    return reponseSucces(res, 200, 'Connexion reussie.', {
      utilisateur,
      token,
    });
  } catch (erreur) {
    console.error('Erreur connexion:', erreur);
    return reponseErreur(res, 500, 'Erreur lors de la connexion.', erreur.message);
  }
};

// GET /profil - Obtenir le profil de l'utilisateur connecte
const profil = async (req, res) => {
  try {
    return reponseSucces(res, 200, 'Profil recupere avec succes.', {
      utilisateur: req.utilisateur,
    });
  } catch (erreur) {
    console.error('Erreur profil:', erreur);
    return reponseErreur(res, 500, 'Erreur lors de la recuperation du profil.', erreur.message);
  }
};

// PUT /profil - Modifier le profil de l'utilisateur connecte
const modifierProfil = async (req, res) => {
  try {
    const { nom, telephone } = req.body;

    // Verifier si le telephone est deja utilise par un autre utilisateur
    if (telephone) {
      const telephoneExistant = await Utilisateur.findOne({
        where: { telephone },
      });
      if (telephoneExistant && telephoneExistant.id !== req.utilisateur.id) {
        return reponseErreur(res, 400, 'Ce numero de telephone est deja utilise.');
      }
    }

    await req.utilisateur.update({ nom, telephone });

    return reponseSucces(res, 200, 'Profil mis a jour avec succes.', {
      utilisateur: req.utilisateur,
    });
  } catch (erreur) {
    console.error('Erreur modification profil:', erreur);
    return reponseErreur(res, 500, 'Erreur lors de la modification du profil.', erreur.message);
  }
};

// PUT /mot-de-passe/modifier - Modifier le mot de passe
const modifierMotDePasse = async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    // Verifier l'ancien mot de passe
    const motDePasseValide = await req.utilisateur.comparerMotDePasse(ancienMotDePasse);
    if (!motDePasseValide) {
      return reponseErreur(res, 400, 'Ancien mot de passe incorrect.');
    }

    // Mettre a jour le mot de passe
    await req.utilisateur.update({ motDePasse: nouveauMotDePasse });

    return reponseSucces(res, 200, 'Mot de passe modifie avec succes.');
  } catch (erreur) {
    console.error('Erreur modification mot de passe:', erreur);
    return reponseErreur(res, 500, 'Erreur lors de la modification du mot de passe.', erreur.message);
  }
};

module.exports = {
  inscription,
  connexion,
  profil,
  modifierProfil,
  modifierMotDePasse,
};
