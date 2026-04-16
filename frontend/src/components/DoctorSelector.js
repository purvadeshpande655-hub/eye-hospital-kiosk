import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslations } from '../hooks/useTranslations';

const DoctorSelector = ({ specialty, onDoctorSelect, onBack, lang }) => {
  const t = useTranslations(lang);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/doctors?specialty=${specialty}`
        );
        const list = Array.isArray(response.data)
          ? response.data
          : response.data.doctors ?? [];
        setDoctors(list);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    if (specialty) fetchDoctors();
  }, [specialty]);

  const specialtyLabel = t[specialty] || specialty.toUpperCase();

  return (
    <div className="step-container">
      <h3>
        {t.selectDoctor} — {specialtyLabel}
      </h3>

      <div className="options-grid">
        {loading ? (
          <p>{lang === 'Marathi' ? 'डॉक्टर लोड होत आहेत...' : 'Loading doctors...'}</p>
        ) : doctors.length > 0 ? (
          doctors.map((doc) => (
            <button
              key={doc._id}
              className="option-card doctor-card"
              onClick={() => onDoctorSelect({ doctorId: doc._id, doctorName: doc.name })}
            >
              <div className="doctor-avatar">👨‍⚕️</div>
              <div className="doctor-info">
                <strong>{doc.name}</strong>
                <p>{doc.qualifications}</p>
              </div>
            </button>
          ))
        ) : (
          <p>{lang === 'Marathi' ? 'डॉक्टर उपलब्ध नाहीत' : 'No doctors available'}</p>
        )}
      </div>

      <button className="back-btn" onClick={onBack}>← {t.back}</button>
    </div>
  );
};

export default DoctorSelector;