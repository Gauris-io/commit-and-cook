import React, { useState, useEffect } from 'react';
import './App.css';

const DiseaseApp = () => {
  const [data, setData] = useState({ molecules: [], recipes: [] });
  const [loading, setLoading] = useState(true);
  const [disease, setDisease] = useState("Diabetes");
  const [region, setRegion] = useState("Indian Subcontinent");
  const [diet, setDiet] = useState("vegan");

  const regions = ["Australian", "Belgian", "Canadian", "Caribbean", "Central American", "Chinese and Mongolian", "Deutschland", "Eastern European", "French", "Greek", "Indian Subcontinent", "Irish", "Italian", "Japanese", "Korean", "Mexican", "Middle Eastern", "Northern Africa", "Rest Africa", "Scandinavian", "South American", "Southeast Asian", "Spanish and Portuguese"];
  const diets = ["vegan", "pescetarian", "ovo_vegetarian", "lacto_vegetarian", "ovo_lacto_vegetarian"];
  const diseases = ["Diabetes", "Hypertension", "Obesity", "Celiac", "PCOS", "Heart Disease", "Anemia", "GERD (Reflux)"];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/data?disease=${disease}&region=${region}&diet=${diet}`);
        const json = await res.json();
        setData(json);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, [disease, region, diet]);

  return (
    <div className="container">
      <header className="header">
        <h1>Flavor Discovery</h1>
        <p>AI-Powered Culinary Science</p>
      </header>

      <div className="beige-card">
        <h3>Settings</h3>
        <div className="filter-section">
          <label className="section-label">Region</label>
          <select className="region-select" value={region} onChange={(e) => setRegion(e.target.value)}>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="filter-section">
          <label className="section-label">Diet</label>
          <div className="button-group">
            {diets.map(d => (
              <button key={d} className={`option-btn ${diet === d ? 'active' : ''}`} onClick={() => setDiet(d)}>
                {d.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label className="section-label">Condition</label>
          <div className="button-group">
            {diseases.map(dis => (
              <button key={dis} className={`option-btn ${disease === dis ? 'active' : ''}`} onClick={() => setDisease(dis)}>
                {dis}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="data-grid">
        <section className="scroll-box">
          <h2 className="grid-title">Molecules</h2>
          {data.molecules.map(m => (
            <div key={m.id} className="molecule-card">
              <h4>{m.name}</h4>
              <p className="flavor-text">Flavor: {m.flavor}</p>
              <span className="sweet-badge">ID: {m.id}</span>
            </div>
          ))}
        </section>

        <section className="scroll-box">
          <h2 className="grid-title">AI Suggested Recipes</h2>
          {data.recipes.map((rec, i) => (
            <div key={i} className="recipe-card-inner">
              <h4>{rec.title}</h4>
              <div className="instructions-text">{rec.instructions}</div>
            </div>
          ))}
        </section>
      </div>

      {loading && <div className="loading-overlay"><div className="spinner"></div><p>Gemini is cooking...</p></div>}
    </div>
  );
};

export default DiseaseApp;