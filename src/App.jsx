import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { styled } from "@mui/system";
import axios from "axios";

const Input = styled("input")({
  display: "none",
});

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [allProbs, setAllProbs] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);

  const infoClases = {
    Apple___Apple_scab: {
      descripcion: "Mancha oscura en hojas y frutos de manzano.",
      recomendacion:
        "Retira hojas infectadas y aplica fungicida si es necesario.",
    },
    Apple___Black_rot: {
      descripcion: "Podredumbre negra en frutos y ramas de manzano.",
      recomendacion:
        "Elimina frutos afectados y mejora la ventilación del árbol.",
    },
    Apple___Cedar_apple_rust: {
      descripcion: "Enfermedad fúngica que causa manchas anaranjadas en hojas.",
      recomendacion: "Retira hojas infectadas y evita plantar cerca de cedros.",
    },
    Apple___healthy: {
      descripcion: "Manzano saludable, sin signos de enfermedad.",
      recomendacion: "Mantén el monitoreo regular y riega adecuadamente.",
    },
    Tomato___healthy: {
      descripcion: "Tomatera saludable, sin signos de enfermedad.",
      recomendacion: "Continúa con el riego y monitoreo regular.",
    },
    default: {
      descripcion: "Sin información específica para esta clase.",
      recomendacion: "Consulta a un especialista agrícola para más detalles.",
    },
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageUrl(URL.createObjectURL(file));
    setPrediction(null);
    setAllProbs([]);
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const backendUrl = "http://localhost:5000/predict";
      const response = await axios.post(backendUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data;
      const clasePred =
        typeof data.class === "string" ? data.class : data.class.toString();
      const probsArray = Array.isArray(data.probabilities)
        ? data.probabilities
        : [];

      // Construir listado de probabilidades
      const listadoProbs = Object.keys(infoClases)
        .filter((cls) => cls !== "default")
        .map((cls, idx) => ({
          clase: cls,
          prob: probsArray[idx] ?? 0,
        }))
        .sort((a, b) => b.prob - a.prob);

      const maxProb = listadoProbs.length ? listadoProbs[0].prob : 0;
      setPrediction({ class: clasePred, score: maxProb });
      setAllProbs(listadoProbs);
    } catch (err) {
      setError("Error al procesar la imagen: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInfo = (predClass) => {
    const keys = Object.keys(infoClases).filter((k) => k !== "default");
    const foundKey = keys.find((k) => predClass.includes(k));
    return infoClases[foundKey] || infoClases["default"];
  };

  return (
    <Box
      sx={{
        overflow: "hidden",
        height: "100vh",
        width: "100vw",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          height: "50%",
          width: "50%",
          background: "linear-gradient(135deg, #e0ffe6 0%, #56ab2f 100%)",
          display: "flex",
          alignItems: "center",

          justifyContent: "center",
          p: { xs: 1, sm: 2, md: 4 },
        }}
      >
        <Card
          sx={{
            width: { xs: "100%", sm: 500, md: 600 },
            maxWidth: "98%",

            borderRadius: 4,
            boxShadow: "0 8px 32px #3a5d1b33",
            bgcolor: "rgba(255,255,255,0.98)",
            p: { xs: 2, sm: 4 },
            m: 0,
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              color: "#2e4d1b",
              fontWeight: 800,
              textShadow: "1px 2px 8px #b6e2b3",
              mb: 2,
              letterSpacing: 1,
            }}
          >
            Sistema de riego automático y detección de enfermedades de plantas
            <br />
            <Typography
              variant="subtitle1"
              component="span"
              sx={{ color: "#56ab2f", fontWeight: 500 }}
            >
              bioInvernadero
            </Typography>
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              mb: 3,
            }}
          >
            <label htmlFor="upload-button">
              <Input
                accept="image/*"
                id="upload-button"
                type="file"
                onChange={handleImageUpload}
              />
              <Button
                variant="contained"
                component="span"
                sx={{
                  bgcolor: "#56ab2f",
                  color: "#fff",
                  fontWeight: 700,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: "0 2px 8px #56ab2f33",
                  "&:hover": { bgcolor: "#3a5d1b" },
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                }}
              >
                Subir imagen
              </Button>
            </label>

            {imageUrl && (
              <CardMedia
                component="img"
                src={imageUrl}
                alt="Imagen subida"
                sx={{
                  maxWidth: { xs: 180, sm: 200, md: 220 },
                  maxHeight: { xs: 180, sm: 200, md: 220 },
                  borderRadius: 3,
                  boxShadow: "0 2px 12px #3a5d1b22",
                  border: "2px solid #a8e063",
                  bgcolor: "#f6fff0",
                  opacity: loading ? 0.5 : 1,
                  transition: "opacity 0.5s ease-in-out",
                  mt: { xs: 2, sm: 0 },
                }}
              />
            )}
          </Box>

          {loading && (
            <Box sx={{ textAlign: "center", my: 3 }}>
              <CircularProgress size={48} sx={{ color: "#56ab2f", mb: 1 }} />
              <Typography sx={{ color: "#3a5d1b", fontWeight: 500 }}>
                Analizando imagen…
              </Typography>
            </Box>
          )}

          {error && (
            <Typography
              sx={{ color: "red", fontWeight: 500, mt: 2 }}
              align="center"
            >
              {error}
            </Typography>
          )}

          {prediction && !loading && (
            <Box sx={{ mt: 3, animation: "fadeIn 0.6s ease-in-out" }}>
              <Typography
                variant="h6"
                sx={{ color: "#3a5d1b", fontWeight: 600, mb: 1 }}
              >
                Resultado:
              </Typography>
              <Box
                sx={{
                  display: "inline-block",
                  bgcolor: "#eaffd0",
                  borderRadius: 1,
                  px: 2,
                  py: 1,
                  boxShadow: "0 2px 8px #3a5d1b11",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ color: "#56ab2f", fontWeight: 700 }}
                >
                  {prediction.class.replace(/_/g, " ")}
                </Typography>
              </Box>

              {prediction.score !== null && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(prediction.score * 100).toFixed(1)}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: "#ddd",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "#56ab2f",
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: "#3a5d1b", mt: 0.5 }}
                  >
                    Confianza: {(prediction.score * 100).toFixed(1)}%
                  </Typography>
                </Box>
              )}

              <Card
                variant="outlined"
                sx={{
                  mt: 2,
                  bgcolor: "#f6fff0",
                  borderRadius: 1,
                  boxShadow: "0 1px 4px #3a5d1b11",
                }}
              >
                <CardContent>
                  {(() => {
                    const info = getInfo(prediction.class);
                    return (
                      <>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          Descripción:
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {info.descripcion}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          Recomendación:
                        </Typography>
                        <Typography variant="body2">
                          {info.recomendacion}
                        </Typography>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              <Box sx={{ mt: 3, textAlign: "left" }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#3a5d1b", fontWeight: 600, mb: 1 }}
                >
                  Desglose de probabilidades:
                </Typography>
                <List>
                  {allProbs.map((item, idx) => (
                    <Box key={idx} sx={{ mb: 2 }}>
                      <ListItem disableGutters sx={{ pl: 0 }}>
                        <ListItemText
                          primary={`${item.clase.replace(/_/g, " ")}: ${(
                            item.prob * 100
                          ).toFixed(1)}%`}
                          primaryTypographyProps={{
                            sx: { fontSize: "0.95rem", color: "#3a5d1b" },
                          }}
                        />
                      </ListItem>
                      <LinearProgress
                        variant="determinate"
                        value={(item.prob * 100).toFixed(1)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "#eee",
                          "& .MuiLinearProgress-bar": {
                            bgcolor:
                              item.clase === prediction.class
                                ? "#56ab2f"
                                : "#a8e06388",
                          },
                        }}
                      />
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))}
                </List>
              </Box>
            </Box>
          )}

          <Typography
            variant="body2"
            sx={{ color: "#56ab2f", mt: 4, opacity: 0.7, textAlign: "center" }}
          >
            &copy; {new Date().getFullYear()} bioInvernadero
          </Typography>

          <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        </Card>
      </Box>
    </Box>
  );
}

export default App;
