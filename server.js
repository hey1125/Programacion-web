require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());




// Rutas de la API (Express las revisará primero)
app.use('/api/users',      require('./routes/userRoutes'));
app.use('/api/products',   require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart',       require('./routes/cartRoutes'));
app.use('/api/orders',     require('./routes/orderRoutes'));


app.use(express.static(path.join(__dirname))); 

// Ruta de prueba
app.get('/', (req, res) => res.json({ message: 'API funcionando correctamente' }));
 
// Conexión a MongoDB y arranque del servidor
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;
 
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  })
  .catch((err) => console.error('Error conectando a MongoDB:', err));
 