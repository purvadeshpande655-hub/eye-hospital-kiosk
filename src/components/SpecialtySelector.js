import React from 'react';
import { useTranslations } from '../hooks/useTranslations';

const SpecialtySelector = ({ onSpecialtySelect, onBack, lang }) => {
  const t = useTranslations(lang);

  const specialties = [
    { id: 'cataract', labelKey: 'cataract', marathi: 'मोतीबिंदू', icon: '👁️' },
    { id: 'glaucoma', labelKey: 'glaucoma', marathi: 'काचबिंदू', icon: '👁️‍🗨️' },
    { id: 'retina',   labelKey: 'retina',   marathi: 'पडदा',     icon: '🔍' },
    { id: 'lasik',    labelKey: 'lasik',    marathi: 'चष्मा काढणे', icon: '🎯' },
  ];

  return (
    <div className="selector-container">
      <button className="back-btn" onClick={onBack}>← {t.back}</button>
      <h2>{t.selectSpecialty}</h2>
      <div className="grid-options">
        {specialties.map((spec) => (
          <button
            key={spec.id}
            className="menu-card"
            onClick={() => onSpecialtySelect(spec.id)}
          >
            <span className="icon">{spec.icon}</span>
            <span className="text">
              {t[spec.labelKey]} ({spec.marathi})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpecialtySelector;