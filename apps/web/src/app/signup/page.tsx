'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authService, PlanType } from '../../services/auth';
import { ApiError } from '../../services/api';
import SignupStage1 from '../../components/SignupStage1';
import SignupStage2 from '../../components/SignupStage2';
import SignupStage3 from '../../components/SignupStage3';

type SignupStage = 1 | 2 | 3;

const getMaxWorkersByPlan = (plan: PlanType): number => {
  switch (plan) {
    case PlanType.Basic:
      return 3;
    case PlanType.Professional:
      return 10;
    case PlanType.Enterprise:
      return Infinity;
    default:
      return 3;
  }
};

export default function SignupPage() {
  // Current stage
  const [currentStage, setCurrentStage] = useState<SignupStage>(1);

  // Stage 1 - User personal info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [wantsTenant, setWantsTenant] = useState(false);

  // Stage 2 - Plan selection
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(PlanType.Basic);

  // Stage 3 - Tenant info
  const [tenantName, setTenantName] = useState('');
  const [tenantDescription, setTenantDescription] = useState('');
  const [tenantAddress, setTenantAddress] = useState('');
  const [tenantCity, setTenantCity] = useState('');
  const [tenantCountry, setTenantCountry] = useState('');

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Stage 1 submission
  const handleStage1Submit = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (!wantsTenant) {
        // Register as client only
        const response = await authService.register({
          firstName,
          lastName,
          email,
          password,
          phoneNumber: phoneNumber || undefined
        });
        console.log('Registration successful:', response.user);
        // Redirect to dashboard or home
        window.location.href = '/';
      } else {
        // Move to stage 2 - Plan selection
        setCurrentStage(2);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Stage 2 submission (move to stage 3)
  const handleStage2Submit = () => {
    setCurrentStage(3);
  };

  // Handle Stage 3 submission (register tenant)
  const handleStage3Submit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.registerTenant({
        userRequest: {
          firstName,
          lastName,
          email,
          password,
          phoneNumber
        },
        tenantRequest: {
          name: tenantName,
          description: tenantDescription,
          address: tenantAddress,
          city: tenantCity,
          country: tenantCountry,
          planType: selectedPlan
        }
      });
      console.log('Tenant registration successful:', response.user);
      // Redirect to dashboard or home
      window.location.href = '/';
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle going back
  const handleBack = () => {
    if (currentStage === 2) {
      setCurrentStage(1);
    } else if (currentStage === 3) {
      setCurrentStage(2);
    }
  };

  // Get max workers for current stage
  const maxWorkers = getMaxWorkersByPlan(selectedPlan);

  // Get stage title
  const getStageTitle = () => {
    switch (currentStage) {
      case 1:
        return 'Crear Cuenta';
      case 2:
        return 'Elige tu Plan';
      case 3:
        return 'Configura tu Negocio';
      default:
        return 'Crear Cuenta';
    }
  };

  // Get stage description
  const getStageDescription = () => {
    switch (currentStage) {
      case 1:
        return 'Crea tu cuenta y comienza a usar nuestra plataforma';
      case 2:
        return 'Selecciona el plan que mejor se adapta a tu negocio';
      case 3:
        return 'Proporciona detalles de tu negocio';
      default:
        return 'Crea tu cuenta y comienza a reservar';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white dark:from-dark dark:via-dark-light dark:to-dark flex items-center justify-center px-4 py-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 mb-3"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>

        {/* Progress indicator */}
        <div className="mb-4 flex justify-between items-center px-2">
          <div className="flex gap-2">
            {[1, 2, 3].map((stage) => (
              <div
                key={stage}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  stage <= currentStage
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-600'
                    : 'bg-secondary-300 dark:bg-secondary-600'
                }`}
                style={{ minWidth: '20px' }}
              ></div>
            ))}
          </div>
          <span className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 ml-3">
            {currentStage}/3
          </span>
        </div>

        <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl overflow-hidden border border-light-darker dark:border-dark-light">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-primary-500 via-secondary-600 to-secondary-700 px-6 py-4 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-300 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
            </div>

            <div className="relative z-10">
              <h1 className="text-2xl font-bold mb-1">
                {getStageTitle()}
              </h1>
              <p className="text-primary-50 text-sm">
                {getStageDescription()}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-xs">
                {error}
              </div>
            )}

            {/* Stage 1 */}
            {currentStage === 1 && (
              <SignupStage1
                firstName={firstName}
                lastName={lastName}
                email={email}
                password={password}
                phoneNumber={phoneNumber}
                showPassword={showPassword}
                wantsTenant={wantsTenant}
                onFirstNameChange={setFirstName}
                onLastNameChange={setLastName}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onPhoneNumberChange={setPhoneNumber}
                onShowPasswordToggle={() => setShowPassword(!showPassword)}
                onWantsTenantChange={setWantsTenant}
                onNext={handleStage1Submit}
                isLoading={isLoading}
              />
            )}

            {/* Stage 2 */}
            {currentStage === 2 && (
              <SignupStage2
                selectedPlan={selectedPlan}
                onPlanChange={setSelectedPlan}
                onBack={handleBack}
                onNext={handleStage2Submit}
                isLoading={isLoading}
              />
            )}

            {/* Stage 3 */}
            {currentStage === 3 && (
              <SignupStage3
                tenantName={tenantName}
                tenantDescription={tenantDescription}
                tenantAddress={tenantAddress}
                tenantCity={tenantCity}
                tenantCountry={tenantCountry}
                maxWorkers={maxWorkers}
                onTenantNameChange={setTenantName}
                onTenantDescriptionChange={setTenantDescription}
                onTenantAddressChange={setTenantAddress}
                onTenantCityChange={setTenantCity}
                onTenantCountryChange={setTenantCountry}
                onBack={handleBack}
                onSubmit={handleStage3Submit}
                isLoading={isLoading}
              />
            )}

            {/* Login link */}
            <div className="text-center pt-3 mt-4 border-t border-light-darker dark:border-secondary-700">
              <p className="text-secondary-600 dark:text-secondary-400 text-xs">
                ¿Ya tienes cuenta?
                {' '}
                <Link
                  href="/login"
                  className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}