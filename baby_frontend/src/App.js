import './App.css';
import RecipeForm from './RecipeForm';

function App() {
  return (
    <div className="container">

      <div className="header">
        <h1>Baby Recipe Finder</h1>
        <p>Healthy meals tailored to your baby’s age & preferences</p>
      </div>

      <RecipeForm />

    </div>
  );
}

export default App;
