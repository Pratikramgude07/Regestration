const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/userdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  name: String,
  dob: Date,
  email: String,
  password: String,
});

const User = mongoose.model('User', UserSchema);

// Registration route
app.post('/api/register', async (req, res) => {
  const { name, dob, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, dob, email, password: hashedPassword });
  await newUser.save();
  const token = jwt.sign({ email }, 'secretKey', { expiresIn: '1h' });
  res.json({ token, name, email });
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ email }, 'secretKey', { expiresIn: '1h' });
    res.json({ token, name: user.name, email: user.email });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
