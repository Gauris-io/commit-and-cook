import React, { useState, useEffect } from "react";
import "./App.css";
import foodImage from "./food.png";

/* -------------------------------
    FOOD IMAGE COMPONENT
-------------------------------- */
const FoodImage = ({ name }) => {
  const [imgUrl, setImgUrl] = useState(null);

  useEffect(() => {
    const fetchFoodImage = async () => {
      try {
        const cleanName = name
          .split(",")[0]
          .trim()
          .split(" ")
          .pop();

        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
            cleanName
          )}`
        );

        const data = await response.json();

        if (data.meals && data.meals.length > 0) {
          setImgUrl(data.meals[0].strMealThumb);
        } else {
          setImgUrl(
            `https://loremflickr.com/600/400/food,${encodeURIComponent(
              cleanName
            )}/all`
          );
        }
      } catch (error) {
        setImgUrl(foodImage);
      }
    };

    if (name) fetchFoodImage();
  }, [name]);

  return (
    <img
      src={imgUrl || foodImage}
      alt={name}
      onError={(e) => (e.target.src = foodImage)}
    />
  );
};

/* -------------------------------
    STATIC DATA
-------------------------------- */
const UI_FLAVORS = [
  { label: "Sour", icon: "🍋" },
  { label: "Spicy", icon: "🌶️" },
  { label: "Tangy", icon: "🍊" },
  { label: "Sweet", icon: "🍓" },
  { label: "Salty", icon: "🧂" },
  { label: "Crunchy", icon: "🥜" },
  { label: "Umami", icon: "🍄" },
  { label: "Cooling", icon: "🧊" },
];

const CLOUD_KITCHENS = [
  { id: 1, name: "Maa's Kitchen", time: "20-25 min", dist: "1.2 km", price: 89 },
  { id: 2, name: "Craving Corner", time: "15-20 min", dist: "0.8 km", price: 99 },
  { id: 3, name: "Desi Delights", time: "25-30 min", dist: "2.1 km", price: 79 },
];

/* -------------------------------
    MAIN APP
-------------------------------- */
function App() {
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRecipes, setShowRecipes] = useState(false);

  // Workflow states
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [generatedRecipe, setGeneratedRecipe] = useState("");
  const [recipeLoading, setRecipeLoading] = useState(false);
  
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [showCloudKitchens, setShowCloudKitchens] = useState(false);

  const toggleFlavor = (flavor) => {
    if (selected.includes(flavor)) {
      setSelected(selected.filter((f) => f !== flavor));
    } else if (selected.length < 3) {
      setSelected([...selected, flavor]);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/search-flavors?selected=${selected.join(",")}`
      );
      const json = await response.json();
      const dataToSet = Array.isArray(json) ? json : json.data || [];
      setResults(dataToSet);
      setShowRecipes(true);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Triggered by "I want this!"
  const handleWantThis = (item) => {
    setActiveItem(item);
    setShowChoiceModal(true);
  };

  const startRecipeWorkflow = async () => {
    const name = activeItem.generic_name || activeItem.ingredient;
    setShowChoiceModal(false);
    setViewingRecipe(name);
    setRecipeLoading(true);

    try {
      const response = await fetch(`/api/get-recipe?name=${encodeURIComponent(name)}`);
      const json = await response.json();
      setGeneratedRecipe(json.recipe || "Recipe not found.");
    } catch (err) {
      setGeneratedRecipe("Could not load the recipe cookbook.");
    } finally {
      setRecipeLoading(false);
    }
  };

  const startOrderWorkflow = () => {
    setShowChoiceModal(false);
    setShowCloudKitchens(true);
  };

  // --- CLOUD KITCHEN VIEW ---
  if (showCloudKitchens) {
    return (
      <div className="cloud-kitchens-page">
        <div className="kitchen-screen">
          <div className="ck-header">
            <button className="ck-back-btn" onClick={() => setShowCloudKitchens(false)}>←</button>
            <h1>Cloud Kitchens</h1>
          </div>
          
          <p className="ck-ordering-sub">
            Ordering: <span className="highlight">{activeItem?.generic_name || activeItem?.ingredient}</span>
          </p>

          <div className="ck-list">
            {CLOUD_KITCHENS.map((k) => (
              <div key={k.id} className="ck-card">
                <div className="ck-info">
                  <h3>{k.name}</h3>
                  <div className="ck-meta">
                    <span>🕒 {k.time}</span>
                    <span>📍 {k.dist}</span>
                  </div>
                </div>
                <div className="ck-action">
                  <span className="ck-price">₹{k.price}</span>
                  <button className="ck-order-btn">Order</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- COOKBOOK VIEW ---
  if (viewingRecipe) {
    return (
      <div className="retro-page">
        <div className="cookbook-container">
          <button className="back-btn" onClick={() => setViewingRecipe(null)}>
            ← Back to Gallery
          </button>
          <div className="cookbook-page">
            <h1 className="recipe-title">{viewingRecipe}</h1>
            <hr />
            {recipeLoading ? (
              <p className="loading-text">Writing down the recipe...</p>
            ) : (
              <div className="recipe-content">
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {generatedRecipe}
                </pre>
              </div>
            )}
            <div className="cookbook-footer">The Crave It Cookbook • 2026</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="retro-page">
      {!showRecipes ? (
        <div className="container">
          <h1 className="header">Select a flavor</h1>
          <div className="flavor-grid">
            {UI_FLAVORS.map((f) => (
              <button
                key={f.label}
                className={`flavor-pill ${selected.includes(f.label) ? "active" : ""}`}
                onClick={() => toggleFlavor(f.label)}
              >
                <span className="icon">{f.icon}</span> {f.label}
              </button>
            ))}
          </div>
          <button
            className="continue-btn"
            disabled={selected.length === 0 || loading}
            onClick={handleContinue}
          >
            {loading ? "Searching..." : "Continue"}
          </button>
        </div>
      ) : (
        <div className="recipe-results-page">
          <button className="back-btn" onClick={() => setShowRecipes(false)}>
            ← Back
          </button>

          <div className="recipe-grid">
            {results.map((item, index) => (
              <div className="recipe-card" key={item._id || index}>
                <div className="recipe-image">
                  <FoodImage name={item.generic_name || item.ingredient} />
                </div>
                <div className="recipe-info">
                  <h2 className="recipe-name">{item.generic_name || item.ingredient}</h2>
                  <p className="recipe-desc">{item.FlavorDB_Category}</p>
                  <button className="want-btn" onClick={() => handleWantThis(item)}>
                    🧡 I want this!
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- CHOICE MODAL --- */}
      {showChoiceModal && (
        <div className="modal-overlay">
          <div className="choice-modal">
            <h2 className="recipe-title">How do you want it?</h2>
            <div className="modal-btns">
              <button className="option-btn recipe" onClick={startRecipeWorkflow}>
                📖 Get Recipe
              </button>
              <button className="option-btn order" onClick={startOrderWorkflow}>
                🚀 Order Instantly
              </button>
            </div>
            <button className="close-modal" onClick={() => setShowChoiceModal(false)}>
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;