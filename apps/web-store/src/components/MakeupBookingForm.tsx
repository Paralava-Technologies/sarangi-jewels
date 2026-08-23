'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api';

export function MakeupBookingForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [locationType, setLocationType] = useState('In-Store (Kochi)');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      serviceName: formData.get('serviceName') as string,
      location: formData.get('location') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      address: formData.get('address') as string,
    };

    try {
      await apiClient.store.createMakeupSession(data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to book session');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card-panel" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3 style={{ color: 'var(--gold-dark)' }}>Session Request Sent</h3>
        <p>Our team will contact you shortly to confirm your booking.</p>
        <button className="btn" onClick={() => setSuccess(false)} style={{ marginTop: '1rem' }}>Book Another</button>
      </div>
    );
  }

  return (
    <div className="card-panel">
      {error && <div className="alert-error" style={{ marginBottom: '1rem', color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label>Service</label>
            <select name="serviceName" required>
              <option>Bridal Makeup Artist + Kit</option>
              <option>Dance Stage Makeup Kit</option>
              <option>Party Glam Artist Session</option>
              <option>Hairstyling + Draping Add-On</option>
            </select>
          </div>
          <div className="field">
            <label>Location</label>
            <select name="location" required value={locationType} onChange={(e) => setLocationType(e.target.value)}>
              <option>In-Store (Kochi)</option>
              <option>Home Visit</option>
            </select>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Date</label>
            <input type="date" name="date" required />
          </div>
          <div className="field">
            <label>Preferred Time</label>
            <input type="time" name="time" required />
          </div>
        </div>
        {locationType === 'Home Visit' && (
          <div className="field">
            <label>Address for Home Visit</label>
            <textarea name="address" placeholder="Full address" rows={3} required />
          </div>
        )}
        <button className="btn btn-gold" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'Submitting...' : 'Check Availability'}
        </button>
      </form>
    </div>
  );
}
