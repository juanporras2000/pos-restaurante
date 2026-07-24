import React, { useState } from 'react';
import './style.css';

export default function StepWizard({
    steps = [],
    onFinish,
    isSubmitting = false,
    finishLabel = 'Finalizar',
    onClose
}) {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState('next');

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;
    const activeStep = steps[currentStep];

    const handleNext = () => {
        if (!isLastStep && (activeStep.isValid ?? true)) {
            setDirection('next');
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (!isFirstStep) {
            setDirection('prev');
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (isLastStep) {
                onFinish();
            } else {
                handleNext();
            }
        }
    };

    return (
        <div className="flex flex-col flex-1 h-full max-w-[365px] mx-auto w-full relative" onKeyDown={handleKeyDown}>
            {/* Indicadores de progreso */}
            <div className="mb-6 shrink-0">
                <div className="flex justify-between items-center text-xs text-gray-500 font-medium mb-2">
                    <span>Paso {currentStep + 1} de {steps.length}</span>
                    <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% completado</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-blue-600 h-full transition-all duration-300 ease-out rounded-full"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Tarjeta del paso actual (se expande para ocupar el espacio central) */}
            <div className="flex-1 flex flex-col justify-start overflow-y-auto">
                <div
                    key={currentStep}
                    className={`transition-all duration-300 transform ${
                        direction === 'next'
                            ? 'animate-fadeInRight'
                            : 'animate-fadeInLeft'
                    }`}
                >
                    {activeStep.title && (
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                            {activeStep.title}
                        </h3>
                    )}
                    {activeStep.subtitle && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {activeStep.subtitle}
                        </p>
                    )}

                    <div className="p-2">
                        {activeStep.content}
                    </div>
                </div>
            </div>

            {/* Botones de Navegación Fijos abajo (mt-auto) */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
                <button
                    type="button"
                    onClick={isFirstStep ? onClose : handlePrev}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    {isFirstStep ? 'Cancelar' : '← Anterior'}
                </button>

                {!isLastStep ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={activeStep.isValid === false}
                        className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center gap-1"
                    >
                        Siguiente →
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onFinish}
                        disabled={isSubmitting || activeStep.isValid === false}
                        className="px-6 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        {isSubmitting ? 'Guardando...' : finishLabel}
                    </button>
                )}
            </div>
        </div>
    );
}
