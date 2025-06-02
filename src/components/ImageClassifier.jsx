import { useEffect, useState, useRef } from "react";
import { loadPlantModel } from "../utils/modelLoader";
import "../components/ImageClassifier.css"; // Estilos opcionales

export default function ImageClassifier() {
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const imageRef = useRef();

  // Cargar modelo al montar el componente
  useEffect(() => {
    setIsLoading(true);
    loadPlantModel()
      .then(setModel)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      imageRef.current.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const predictImage = async () => {
    if (!model || !imageRef.current.complete) return;

    try {
      setIsLoading(true);
      const results = await model.predict(imageRef.current);
      setPredictions(results.slice(0, 5)); // Top 5 predicciones
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="classifier-container">
      <h1>Clasificador de Plantas</h1>

      {error && <div className="error">{error}</div>}

      <div className="upload-section">
        <label>
          Sube una imagen:
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            disabled={isLoading}
          />
        </label>
      </div>

      <div className="preview-section">
        <img
          ref={imageRef}
          onLoad={predictImage}
          alt="Vista previa"
          style={{ display: predictions.length ? "block" : "none" }}
        />
      </div>

      {isLoading && <div className="loading">Procesando...</div>}

      {predictions.length > 0 && (
        <div className="results-section">
          <h2>Resultados:</h2>
          <ul>
            {predictions.map((item, index) => (
              <li key={index}>
                <span className="class-name">{item.className}</span>
                <span className="confidence">{item.percentage}</span>
                <div
                  className="confidence-bar"
                  style={{ width: `${item.probability * 100}%` }}
                ></div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
