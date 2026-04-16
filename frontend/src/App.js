import React, { useState } from 'react';
import axios from 'axios';
import { useTranslations } from './hooks/useTranslations';
import PatientRegistrationForm from './components/PatientRegistrationForm';
import SpecialtySelector from './components/SpecialtySelector';
import DoctorSelector from './components/DoctorSelector';
import './App.css';

const API = 'http://localhost:5000';

function App() {
  const [step, setStep] = useState('language');
  const [lang, setLang] = useState('English');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [token, setToken] = useState(null);
  const [helpRequested, setHelpRequested] = useState(false);

  const [patientData, setPatientData] = useState({
    name: '', phone: '', age: '', gender: '',
    specialty: '', doctorId: '', doctorName: '', patientId: ''
  });

  const [queueData, setQueueData] = useState({ position: 0, waitTime: 0, doctorName: '' });
  const [registrationStep, setRegistrationStep] = useState('form');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState({ doctorId: '', doctorName: '' });

  const [appointmentData, setAppointmentData] = useState({ phone: '', patientId: '', appointmentId: '' });
  const [appointmentStep, setAppointmentStep] = useState('search');

  const t = useTranslations(lang);

  const handleHelp = () => {
    setHelpRequested(true);
    setTimeout(() => setHelpRequested(false), 5000);
  };

  // ── NEW PATIENT SUBMIT ──────────────────────────────────────────────────────
  // Posts to /api/patients (correct route)
  const handleFormSubmit = async (formData) => {
    try {
      console.log('📤 Submitting to /api/patients:', formData);

      const response = await axios.post(`${API}/api/patients`, {
        name:       formData.name,
        phone:      formData.phone,
        age:        formData.age,
        gender:     formData.gender,
        specialty:  formData.specialty,
        doctorId:   formData.doctorId,
        doctorName: formData.doctorName,
      });

      console.log('✅ Response:', response.data);

      if (response.data.success) {
        setToken(response.data.tokenNumber);
        setPatientData(prev => ({ ...prev, ...response.data.patient }));
        setQueueData({
          position: response.data.position || 1,
          waitTime: response.data.waitTime || 15,
          doctorName: formData.doctorName,
        });
        setStep('success');
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      console.error('❌ Submission Error:', msg);
      alert(`Registration failed:\n${msg}`);
    }
  };

  // ── LANGUAGE SCREEN ─────────────────────────────────────────────────────────
  if (step === 'language') {
    return (
      <div className={`app fade-in ${isHighContrast ? 'dark' : ''} ${isLargeText ? 'large-text' : ''}`}>
        <div className="screen">
          <div className="logo-section">
            <h1>Mahatme Eye Hospital</h1>
            <p>महात्मे नेत्र रुग्णालय</p>
          </div>
          <h2>{t.selectLanguage}</h2>
          <div className="accessibility-options">
            <button className={`accessibility-btn ${isHighContrast ? 'active' : ''}`} onClick={() => setIsHighContrast(!isHighContrast)}>{t.highContrast}</button>
            <button className={`accessibility-btn ${isLargeText ? 'active' : ''}`} onClick={() => setIsLargeText(!isLargeText)}>{t.largeText}</button>
          </div>
          <div className="btn-stack">
            <button className="lang-btn" onClick={() => { setLang('English'); setStep('menu'); }}>English</button>
            <button className="lang-btn" onClick={() => { setLang('Marathi'); setStep('menu'); }}>मराठी</button>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN MENU ────────────────────────────────────────────────────────────────
  if (step === 'menu') {
    return (
      <div className={`app fade-in ${isHighContrast ? 'dark' : ''} ${isLargeText ? 'large-text' : ''}`}>
        <div className="screen">
          <div className="top-nav">
            <button onClick={() => setIsHighContrast(!isHighContrast)}>🌓 {t.highContrast}</button>
            <button onClick={() => setIsLargeText(!isLargeText)}>🔍 {t.largeText}</button>
          </div>
          <h1>{t.mainMenu}</h1>
          <div className="menu-grid">
            <button className="menu-item" onClick={() => { setRegistrationStep('form'); setStep('new-patient'); }}>
              <span className="icon">👤</span><span>{t.newPatient}</span>
            </button>
            <button className="menu-item" onClick={() => { setAppointmentStep('search'); setStep('appointment'); }}>
              <span className="icon">📋</span><span>{t.appointmentCheckIn}</span>
            </button>
            <button className="menu-item" onClick={() => setStep('surgery')}>
              <span className="icon">✂️</span><span>{t.surgeryCheckIn}</span>
            </button>
          </div>
        </div>
        <button className="help-button" onClick={handleHelp}>{t.help}</button>
      </div>
    );
  }

  // ── NEW PATIENT REGISTRATION ─────────────────────────────────────────────────
  if (step === 'new-patient') {
    const handleSpecialtySelect = (specialty) => {
      setSelectedSpecialty(specialty);
      setPatientData(prev => ({ ...prev, specialty }));
      setRegistrationStep('doctor');
    };

    const handleDoctorSelect = (doctor) => {
      setSelectedDoctor(doctor);
      setPatientData(prev => ({ ...prev, ...doctor }));
      setRegistrationStep('confirmation');
    };

    const handleBack = () => {
      if (registrationStep === 'form') setStep('menu');
      else if (registrationStep === 'specialty') setRegistrationStep('form');
      else if (registrationStep === 'doctor') setRegistrationStep('specialty');
      else if (registrationStep === 'confirmation') setRegistrationStep('doctor');
    };

    return (
      <div className={`app fade-in ${isHighContrast ? 'dark' : ''} ${isLargeText ? 'large-text' : ''}`}>
        <div className="screen">

          {registrationStep === 'form' && (
            <PatientRegistrationForm
              lang={lang}
              isHighContrast={isHighContrast}
              isLargeText={isLargeText}
              onSubmit={handleFormSubmit}   // ✅ posts directly to /api/patients
              onBack={() => setStep('menu')}
            />
          )}

          {registrationStep === 'specialty' && (
            <SpecialtySelector
              lang={lang} isHighContrast={isHighContrast} isLargeText={isLargeText}
              selectedSpecialty={selectedSpecialty}
              onSpecialtySelect={handleSpecialtySelect}
              onBack={handleBack}
            />
          )}

          {registrationStep === 'doctor' && (
            <DoctorSelector
              lang={lang} isHighContrast={isHighContrast} isLargeText={isLargeText}
              specialty={selectedSpecialty}
              selectedDoctor={selectedDoctor.doctorId}
              onDoctorSelect={handleDoctorSelect}
              onBack={handleBack}
            />
          )}

          {registrationStep === 'confirmation' && (
            <div className="confirmation-container">
              <button className="back-btn" onClick={handleBack}>← {t.back}</button>
              <h2>{t.chatbotConfirm}</h2>
              <div className="form-box">
                <p><strong>{t.enterName}:</strong> {patientData.name}</p>
                <p><strong>{t.enterPhone}:</strong> {patientData.phone}</p>
                <p><strong>{t.enterAge}:</strong> {patientData.age}</p>
                <p><strong>{t.selectGender}:</strong> {patientData.gender}</p>
                <p><strong>{t.selectSpecialty}:</strong> {patientData.specialty}</p>
                <p><strong>{t.selectDoctor}:</strong> {patientData.doctorName}</p>
              </div>
              {/* Confirmation page uses handleFormSubmit with current patientData */}
              <button className="next-btn" onClick={() => handleFormSubmit(patientData)}>
                {t.verify} & {t.next}
              </button>
            </div>
          )}
        </div>
        <button className="help-button" onClick={handleHelp}>{t.help}</button>
      </div>
    );
  }

  // ── SUCCESS SCREEN ───────────────────────────────────────────────────────────
  if (step === 'success') {
    const waitStatus = queueData.waitTime < 10 ? 'short' : queueData.waitTime < 20 ? 'medium' : 'long';
    return (
      <div className={`app fade-in ${isHighContrast ? 'dark' : ''} ${isLargeText ? 'large-text' : ''}`}>
        <div className="screen">
          <div className="check-mark">✓</div>
          <h2>{t.checkInSuccess}</h2>
          <div className="token-card">
            <p>{t.yourToken}</p>
            <div className="token-id">{token}</div>
          </div>
          <div className="wait-time-container">
            <h3>{t.waitingTime}</h3>
            <div className="wait-time-indicator">
              <div className={`wait-status ${waitStatus}`}></div>
              <span>{queueData.waitTime} {t.minutes}</span>
            </div>
            <div className="queue-position">
              {t.currentlyInQueue} {queueData.position} {t.inQueueFor} {queueData.doctorName}
            </div>
            <p>{t.pleaseWait}</p>
          </div>
          <div className="navigation-map">
            <h3>{t.navigationHelp}</h3>
            <div className="map-placeholder">🗺️ {t.goToRoom} 203 → {t.takeHallway} {t.right}</div>
          </div>
          <button className="done-btn" onClick={() => { setStep('language'); setRegistrationStep('form'); }}>
            {t.back} to {t.mainMenu}
          </button>
        </div>
        <button className="help-button" onClick={handleHelp}>{t.help}</button>
      </div>
    );
  }

  // ── APPOINTMENT CHECK-IN ─────────────────────────────────────────────────────
  if (step === 'appointment') {
    const handleAppointmentSearch = async () => {
      try {
        const response = await axios.get(`${API}/api/patient/${appointmentData.phone}`);
        if (response.data.success) {
          setAppointmentData(prev => ({
            ...prev,
            patientId: response.data.patient._id,
            appointmentId: 'APT-' + Date.now()
          }));
          setAppointmentStep('found');
        } else {
          setAppointmentStep('not-found');
        }
      } catch {
        setAppointmentStep('not-found');
      }
    };

    const handleAppointmentConfirm = () => {
      setToken(Math.floor(1000 + Math.random() * 9000));
      setQueueData({ position: Math.floor(Math.random() * 10) + 1, waitTime: Math.floor(Math.random() * 30) + 5, doctorName: 'Dr. Mahatme' });
      setStep('success');
    };

    return (
      <div className={`app fade-in ${isHighContrast ? 'dark' : ''} ${isLargeText ? 'large-text' : ''}`}>
        <div className="screen">
          <button className="back-btn" onClick={() => setStep('menu')}>← {t.back}</button>

          {appointmentStep === 'search' && (
            <>
              <h2>{t.appointmentCheckIn}</h2>
              <p>{t.enterPhoneToFind}</p>
              <div className="form-box">
                <input type="tel" className="form-input" placeholder={t.enterPhone}
                  value={appointmentData.phone}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <button className="next-btn" onClick={handleAppointmentSearch} disabled={!appointmentData.phone || appointmentData.phone.length < 10}>
                {t.searchAppointment}
              </button>
            </>
          )}

          {appointmentStep === 'found' && (
            <>
              <h2>{t.appointmentFound}</h2>
              <div className="form-box">
                <p><strong>{t.phone}:</strong> {appointmentData.phone}</p>
                <p><strong>{t.appointmentId}:</strong> {appointmentData.appointmentId}</p>
                <p><strong>{t.status}:</strong> {t.scheduled}</p>
              </div>
              <button className="next-btn" onClick={handleAppointmentConfirm}>{t.confirmCheckIn}</button>
            </>
          )}

          {appointmentStep === 'not-found' && (
            <>
              <h2>{t.appointmentNotFound}</h2>
              <p>{t.noAppointmentFound}</p>
              <div className="btn-stack">
                <button className="next-btn" onClick={() => { setAppointmentData({ phone: '', patientId: '', appointmentId: '' }); setAppointmentStep('search'); }}>{t.tryAgain}</button>
                <button className="next-btn" onClick={() => setStep('new-patient')}>{t.registerNewPatient}</button>
              </div>
            </>
          )}
        </div>
        <button className="help-button" onClick={handleHelp}>{t.help}</button>
      </div>
    );
  }

  // ── SURGERY CHECK-IN ─────────────────────────────────────────────────────────
  if (step === 'surgery') {
    return (
      <div className={`app fade-in ${isHighContrast ? 'dark' : ''} ${isLargeText ? 'large-text' : ''}`}>
        <div className="screen">
          <button className="back-btn" onClick={() => setStep('menu')}>← {t.back}</button>
          <h2>{t.surgeryCheckIn}</h2>
          <div className="form-box">
            <label>{t.enterPatientId}</label>
            <input type="text" placeholder="SUR001"
              value={patientData.patientId}
              onChange={(e) => setPatientData(prev => ({ ...prev, patientId: e.target.value }))}
            />
            <button className="verify-btn" onClick={() => patientData.patientId && setStep('surgery-confirm')}>{t.verify}</button>
          </div>
        </div>
        <button className="help-button" onClick={handleHelp}>{t.help}</button>
      </div>
    );
  }

  if (step === 'surgery-confirm') {
    return (
      <div className={`app fade-in ${isHighContrast ? 'dark' : ''} ${isLargeText ? 'large-text' : ''}`}>
        <div className="screen">
          <button className="back-btn" onClick={() => setStep('surgery')}>← {t.back}</button>
          <h2>{t.surgeryConfirmation}</h2>
          <div className="form-box">
            <p><strong>{t.assignedDoctor}:</strong> Dr. Mahatme</p>
            <p><strong>{t.surgeryTime}:</strong> 10:30 AM</p>
            <p><strong>{t.preparationRoom}:</strong> Room 105</p>
            <br />
            <p>{t.surgeryInstructions}</p>
            <p>{t.fastingInstructions}</p>
            <p><strong>{t.emergencyContact}:</strong> +91 98765 43210</p>
          </div>
          <button className="done-btn" onClick={() => setStep('language')}>{t.back} to {t.mainMenu}</button>
        </div>
        <button className="help-button" onClick={handleHelp}>{t.help}</button>
      </div>
    );
  }

  if (helpRequested) {
    return (
      <div className="privacy-shield">
        <div>
          <h2>🆘 {t.staffAlert}</h2>
          <p>{t.helpComing}</p>
        </div>
      </div>
    );
  }

  return null;
}

export default App;