let express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Connect to SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// 1  Route to fetch all restaurants
app.get('/restaurants', (req, res) => {
  const query = 'SELECT * FROM restaurants';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching restaurants:', err.message);
      res.status(500).json({ error: 'Failed to fetch restaurants' });
    } else {
      res.json({ restaurants: rows });
    }
  });
});
// /restaurants

//2
app.get('/restaurants/details/:id', (req, res) => {
  const restaurantId = req.params.id;

  db.get(
    'SELECT * FROM restaurants WHERE id = ?',
    [restaurantId],
    (err, row) => {
      if (err) {
        console.error('Error fetching restaurant:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
      } else if (!row) {
        res.status(404).json({ error: 'Restaurant not found' });
      } else {
        res.json({ restaurant: row });
      }
    }
  );
});
// /restaurants/details/1

//3
app.get('/restaurants/cuisine/:cuisine', (req, res) => {
  const cuisine = req.params.cuisine;

  const query = `SELECT * FROM restaurants WHERE cuisine = ?`;
  db.all(query, [cuisine], (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'No restaurants found for the given cuisine.' });
    }
    res.json({ restaurants: rows });
  });
});
// /restaurants/cuisine/Indian

//4
app.get('/restaurants/filter', (req, res) => {
  // Retrieve query parameters
  const { isVeg, hasOutdoorSeating, isLuxury } = req.query;

  // Build the SQL query dynamically
  let query = `SELECT * FROM restaurants WHERE 1=1`;
  const params = [];

  if (isVeg) {
    query += ' AND isVeg = ?';
    params.push(isVeg);
  }
  if (hasOutdoorSeating) {
    query += ' AND hasOutdoorSeating = ?';
    params.push(hasOutdoorSeating);
  }
  if (isLuxury) {
    query += ' AND isLuxury = ?';
    params.push(isLuxury);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.json({ restaurants: rows });
    }
  });
});
// /restaurants/filter?isVeg=true&hasOutdoorSeating=true&isLuxury=false

// 5 Endpoint to fetch restaurants sorted by rating
app.get('/restaurants/sort-by-rating', (req, res) => {
  // SQL query to fetch and sort restaurants by rating (highest to lowest)
  const query = `
      SELECT * FROM restaurants
      ORDER BY rating DESC
    `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching restaurants:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Return the result as JSON
      res.json({ restaurants: rows });
    }
  });
});
// /restaurants/sort-by-rating

//6
app.get('/dishes', (req, res) => {
  const sql = 'SELECT * FROM dishes';

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Send the result as a JSON response
    res.json({ dishes: rows });
  });
});
//  /dishes

//7
app.get('/dishes/details/:id', (req, res) => {
  const dishId = req.params.id;

  // Query to fetch dish by ID
  const query = 'SELECT * FROM dishes WHERE id = ?';

  db.get(query, [dishId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (row) {
      return res.json({
        dish: {
          id: row.id,
          name: row.name,
          price: row.price,
          rating: row.rating,
          isVeg: row.isVeg,
        },
      });
    } else {
      return res.status(404).json({ error: 'Dish not found' });
    }
  });
});
// /dishes/details/1

//8
// Fetch dishes based on filter (isVeg)
app.get('/dishes/filter', (req, res) => {
  const isVeg = req.query.isVeg; // Get filter parameter from query string

  // Validate filter value (true/false)
  if (isVeg !== 'true' && isVeg !== 'false') {
    return res
      .status(400)
      .json({ error: "Invalid isVeg filter. Use 'true' or 'false'." });
  }

  // Query to fetch dishes based on the isVeg filter
  const query = 'SELECT * FROM dishes WHERE isVeg = ?';

  db.all(query, [isVeg], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Send the result in the expected format
    res.json({
      dishes: rows,
    });
  });
});
// /dishes/filter?isVeg=true

//9
app.get('/dishes/sort-by-price', (req, res) => {
  const query = 'SELECT * FROM dishes ORDER BY price ASC'; // SQL query to fetch dishes sorted by price

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Send the sorted dishes as a response
    res.json({ dishes: rows });
  });
});
// /dishes/sort-by-price

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
