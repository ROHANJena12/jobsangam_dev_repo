import React, { useState } from 'react';

export default function PostJobPage() {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess('');
    setError('');
    // Simple validation
    if (!title || !company || !location || !salaryMin || !salaryMax || !description) {
      setError('Please fill all required fields.');
      return;
    }
    try {
      // Send job data to backend
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          company,
          location,
          salaryMin: Number(salaryMin),
          salaryMax: Number(salaryMax),
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          description
        })
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Job posted successfully!');
        setTitle('');
        setCompany('');
        setLocation('');
        setSalaryMin('');
        setSalaryMax('');
        setTags('');
        setDescription('');
      }
    } catch (err) {
      setError('Failed to post job. Please try again.');
    }
  }

  return (
    <div className="container-p" style={{ padding: '48px 0' }}>
      <div className="card" style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
        <div className="h2">Post a Job</div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <input className="input" placeholder="Job Title *" value={title} onChange={e => setTitle(e.target.value)} />
          <input className="input" placeholder="Company Name *" value={company} onChange={e => setCompany(e.target.value)} />
          <input className="input" placeholder="Location *" value={location} onChange={e => setLocation(e.target.value)} />
          <input className="input" type="number" placeholder="Minimum Salary (₹) *" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} />
          <input className="input" type="number" placeholder="Maximum Salary (₹) *" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} />
          <input className="input" placeholder="Skills/Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
          <textarea className="input" placeholder="Job Description *" value={description} onChange={e => setDescription(e.target.value)} style={{ minHeight: 100 }} />
          <button className="btn" type="submit">Post Job</button>
        </form>
        {success && <div style={{ color: 'green', marginTop: 12 }}>{success}</div>}
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}