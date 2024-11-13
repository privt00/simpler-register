import express from 'express';
import session from 'express-session';
import { loadModules } from './handlers/modulesLoader';
import path from 'path';


const app = express();
const port = process.env.PORT || 3000;

app.use(session({
  secret: 'dev',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

loadModules(app)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server läuft unter http://localhost:${port}`);
    });    
  })
  .catch((err) => {
    console.error('Es gab einen Fehler beim laden der Module:', err);
  });

