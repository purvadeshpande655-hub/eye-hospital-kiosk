import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslations } from '../hooks/useTranslations';

const PatientRegistrationForm = ({ lang, onSubmit, onBack }) => {
  const t = useTranslations(lang);

  const [formData, setFormData] = useState({
    name: '', phone: '', age: '', gender: '', specialty: '', doctorId: '', doctorName: ''
  });
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [doctorError, setDoctorError] = useState('');

  useEffect(() => {
    if (!formData.specialty) {
      setDoctors([]);
      setDoctorError('');
      return;
    }

    setLoadingDoctors(true);
    setDoctorError('');

    axios
      .get(`http://localhost:5000/api/doctors?specialty=${formData.specialty}`)
      .then(res => {
        console.log('✅ Doctor API raw response:', res.data);

        // Handle both plain array and { doctors: [] } formats
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.doctors)
          ? res.data.doctors
          : [];

        console.log(`✅ Doctors found for "${formData.specialty}":`, list.length, list);
        setDoctors(list);

        if (list.length === 0) {
          setDoctorError(`No doctors found for specialty: ${formData.specialty}`);
        }
      })
      .catch(err => {
        console.error('❌ Failed to fetch doctors:', err.message);
        setDoctorError('Server error fetching doctors');
        setDoctors([]);
      })
      .finally(() => setLoadingDoctors(false));

  }, [formData.specialty]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'doctorId') {
      const doc = doctors.find(d => d._id === value);
      setFormData({ ...formData, doctorId: value, doctorName: doc ? doc.name : '' });
    } else {
      // Reset doctorId when specialty changes
      if (name === 'specialty') {
        setFormData({ ...formData, specialty: value, doctorId: '', doctorName: '' });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    }
  };

  const doctorPlaceholder = !formData.specialty
    ? (lang === 'Marathi' ? 'आधी विशेषता निवडा' : 'Select specialty first')
    : loadingDoctors
    ? (lang === 'Marathi' ? 'डॉक्टर लोड होत आहेत...' : 'Loading doctors...')
    : doctors.length === 0
    ? (lang === 'Marathi' ? 'डॉक्टर उपलब्ध नाहीत' : 'No doctors available')
    : (lang === 'Marathi' ? 'डॉक्टर निवडा' : 'Choose your doctor');

  return (
    <div className="reg-container">
      <div className="reg-header">
        <span className="hospital-icon">🏥</span>
        <h2>{t.newPatient}</h2>
        <p>{lang === 'Marathi' ? 'कृपया खालील तपशील भरा' : 'Please fill in the details below'}</p>
      </div>

      <div className="form-section">
        <h4><span className="step-num">1</span> {lang === 'Marathi' ? 'वैयक्तिक माहिती' : 'Personal Details'}</h4>
        <div className="input-group">
          <input name="name" placeholder={t.enterName} onChange={handleChange} />
          <div className="row">
            <input name="age" placeholder={t.enterAge} onChange={handleChange} />
            <select name="gender" onChange={handleChange}>
              <option value="">{t.selectGender}</option>
              <option value="male">{t.male}</option>
              <option value="female">{t.female}</option>
              <option value="other">{t.other}</option>
            </select>
          </div>
          <input name="phone" placeholder={t.enterPhone} onChange={handleChange} />
        </div>
      </div>

      <div className="form-section">
        <h4><span className="step-num">2</span> {lang === 'Marathi' ? 'अपॉइंटमेंट माहिती' : 'Appointment Details'}</h4>
        <div className="input-group">
          <select name="specialty" onChange={handleChange} className="highlight-select">
            <option value="">{t.selectSpecialty}</option>
            <option value="cataract">{t.cataract} (मोतीबिंदू)</option>
            <option value="glaucoma">{t.glaucoma} (काचबिंदू)</option>
            <option value="retina">{t.retina} (पडदा)</option>
            <option value="lasik">{t.lasik} (चष्मा काढणे)</option>
          </select>

          <select
            name="doctorId"
            onChange={handleChange}
            disabled={!formData.specialty || loadingDoctors || doctors.length === 0}
          >
            <option value="">{doctorPlaceholder}</option>
            {doctors.map(doc => (
              <option key={doc._id} value={doc._id}>
                {doc.name} — {doc.qualifications}
              </option>
            ))}
          </select>

          {/* Debug info - remove after fixing */}
          {doctorError && (
            <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
              ⚠️ {doctorError}
            </p>
          )}
        </div>
      </div>

      <div className="reg-footer">
        <button onClick={onBack} className="btn-secondary">
          {lang === 'Marathi' ? 'रद्द करा' : 'Cancel'}
        </button>
        <button
          onClick={() => onSubmit(formData)}
          className="btn-primary"
          disabled={!formData.doctorId || !formData.name}
        >
          {lang === 'Marathi' ? 'नोंदणी पुष्टी करा →' : 'Confirm Registration →'}
        </button>
      </div>
    </div>
  );
};

export default PatientRegistrationForm;