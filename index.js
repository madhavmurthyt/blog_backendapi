import express from 'express';
import sql from './connectToDB.js';
const app = express();
const port = 3012;

app.use(express.json());


app.post('/posts', async (req, res) => {
    const { title, content, category, tags } = req.body;
    try {
        const result = await sql`INSERT INTO blogs 
                                  (title, content, category, tags) 
                                    VALUES (${title}, ${content}, ${category}, ${tags})
                                    RETURNING *
                                  `;
        res.status(201).json({ message: 'Post created successfully', post: result[0] });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Bad Request' });
    }
});

// Get all blog posts
app.get('/posts', async (req, res) => {
  try { 
    const term = req.query.term;
    let posts;
    if(term) {
      const pattern = `%${term}%`;
                 posts = await sql`SELECT *
                            FROM blogs
                              WHERE title ILIKE ${pattern}
                                OR content ILIKE ${pattern}
                                OR category ILIKE ${pattern}
                                `;
    } else {
                  posts = await sql`SELECT id, title,content,category,tags, created_at, updated_at FROM blogs ORDER BY id ASC`;

    }
    if(posts.length === 0) {
      return res.status(404).json({ error: 'Not Found' });
    }
    
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});


// Get one blog
app.get('/posts/:id', async (req, res) => {
  try { 
    const posts = await sql`SELECT id, title,content,category,tags, created_at, updated_at FROM blogs where id=${req.params.id}`;
    if(posts.length === 0) {
      return res.status(404).json({ error: 'Not Found' });
    }
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: 'Not Found' });
  }
});

// Update a blog post
app.put('/posts/:id', async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const result = await sql`UPDATE blogs 
                              SET title=${title}, content=${content}, category=${category}, tags=${tags}, updated_at=now() 
                                WHERE id=${req.params.id}
                                RETURNING * 
                   `;
    res.status(200).json({ message: 'Post updated successfully',post: result[0] });   
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Bad Request' });

  }
});

app.delete('/posts/:id', async (req, res) => {
  try {
    await sql`DELETE FROM blogs WHERE id=${req.params.id}`;
    res.status(204).json({ message: 'No Content' });
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: 'Not Found' });
  }
});

app.listen(port, () => {
  console.log(`Blog backend API listening at http://localhost:${port}`);
});