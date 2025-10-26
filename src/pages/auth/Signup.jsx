import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData?.username?.trim()) {
      return 'Le nom d\'utilisateur est requis';
    }
    if (formData?.username?.trim()?.length < 3) {
      return 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }
    if (!formData?.fullName?.trim()) {
      return 'Le nom complet est requis';
    }
    if (!formData?.email?.trim()) {
      return 'L\'adresse email est requise';
    }
    if (!formData?.email?.includes('@')) {
      return 'Veuillez entrer une adresse email valide';
    }
    if (formData?.password?.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (formData?.password !== formData?.confirmPassword) {
      return 'Les mots de passe ne correspondent pas';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setAuthError('');

    const validationError = validateForm();
    if (validationError) {
      setAuthError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(formData?.email, formData?.password, {
        full_name: formData?.fullName,
        username: formData?.username
      });
      
      if (result?.success) {
        navigate('/auth/login', {
          state: { 
            message: 'Compte créé avec succès ! Veuillez vous connecter pour continuer.',
            email: formData?.email
          }
        });
      } else {
        setAuthError(result?.error || 'Erreur lors de la création du compte');
      }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        setAuthError('Impossible de se connecter au service d\'authentification. Votre projet Supabase pourrait être en pause ou inactif. Veuillez vérifier votre tableau de bord Supabase.');
      } else {
        setAuthError('Une erreur s\'est produite. Veuillez réessayer.');
        console.error('Erreur JavaScript lors de l\'authentification:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Créer votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Rejoignez la plateforme de trading
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {authError && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-md text-sm">
              <div className="flex justify-between items-start">
                <span>{authError}</span>
                <button
                  type="button"
                  onClick={() => navigator?.clipboard?.writeText(authError)}
                  className="ml-2 text-red-400 hover:text-red-200 text-xs underline"
                  title="Copier le message d'erreur"
                >
                  copier
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Choisissez votre nom d'utilisateur"
                value={formData?.username}
                onChange={handleChange}
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-400">Minimum 3 caractères, sera votre identifiant unique</p>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                Nom complet
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Entrez votre nom complet"
                value={formData?.fullName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Entrez votre adresse email"
                value={formData?.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Créez un mot de passe (min. 6 caractères)"
                value={formData?.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirmez votre mot de passe"
                value={formData?.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Création du compte...' : 'Créer le compte'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-gray-300">Vous avez déjà un compte ? </span>
            <Link to="/auth/login" className="text-blue-400 hover:text-blue-300">
              Se connecter
            </Link>
          </div>

          {/* Feature Preview */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg">
            <h3 className="text-sm font-medium text-blue-300 mb-2">🚀 Ce que vous obtiendrez :</h3>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Données de marché en temps réel avec l'API Finnhub</li>
              <li>• Suivi de portefeuille et analyses</li>
              <li>• Insights de trading alimentés par l'IA</li>
              <li>• Outils avancés de gestion des risques</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;